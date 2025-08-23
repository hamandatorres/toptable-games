/**
 * SQL Injection Prevention and Database Security Middleware
 * Provides additional layers of protection beyond parameterized queries
 */

const validator = require("validator");

class SQLSecurityMiddleware {
	/**
	 * Validates and sanitizes input parameters to prevent SQL injection
	 */
	static validateInput(req, res, next) {
		try {
			// Check for common SQL injection patterns
			const sqlInjectionPatterns = [
				/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
				/(--|\/\*|\*\/|;|'|"|`)/g,
				/(\bOR\b.*\b=\b|\bAND\b.*\b=\b)/gi,
				/(INFORMATION_SCHEMA|SYS\.|MASTER\.|msdb|tempdb)/gi,
				/(xp_|sp_|fn_)/gi,
				/(WAITFOR|DELAY)/gi,
			];

			const checkForSQLInjection = (value, fieldName) => {
				if (typeof value !== "string") return;

				for (const pattern of sqlInjectionPatterns) {
					if (pattern.test(value)) {
						console.warn(
							`🚨 Potential SQL injection attempt detected in field '${fieldName}': ${value}`
						);
						throw new Error(`Invalid characters detected in ${fieldName}`);
					}
				}
			};

			// Recursively check all request parameters
			const checkObject = (obj, prefix = "") => {
				for (const [key, value] of Object.entries(obj)) {
					const fieldName = prefix ? `${prefix}.${key}` : key;

					if (typeof value === "object" && value !== null) {
						checkObject(value, fieldName);
					} else {
						checkForSQLInjection(value, fieldName);
					}
				}
			};

			// Check all input sources
			if (req.body) checkObject(req.body, "body");
			if (req.query) checkObject(req.query, "query");
			if (req.params) checkObject(req.params, "params");

			next();
		} catch (error) {
			console.error("SQL Security validation failed:", error.message);
			return res.status(400).json({
				error: "Invalid input detected",
				message: "Request contains potentially unsafe characters",
			});
		}
	}

	/**
	 * Validates specific input types with additional rules
	 */
	static validateUserInput(req, res, next) {
		const { body } = req;

		try {
			// Email validation
			if (body.email && !validator.isEmail(body.email)) {
				return res.status(400).json({ error: "Invalid email format" });
			}

			// Username validation (alphanumeric + underscore, 3-20 chars)
			if (
				body.username &&
				!validator.matches(body.username, /^[a-zA-Z0-9_]{3,20}$/)
			) {
				return res.status(400).json({
					error:
						"Username must be 3-20 characters, alphanumeric and underscore only",
				});
			}

			// Password strength validation
			if (body.password && !this.isStrongPassword(body.password)) {
				return res.status(400).json({
					error:
						"Password must be at least 8 characters with uppercase, lowercase, number, and special character",
				});
			}

			// Game ID validation (if present)
			if (
				body.game_id &&
				!validator.isAlphanumeric(body.game_id.replace(/[_-]/g, ""))
			) {
				return res.status(400).json({ error: "Invalid game ID format" });
			}

			// Numeric validation for ratings, play counts, etc.
			if (body.rating !== undefined) {
				const rating = parseInt(body.rating);
				if (isNaN(rating) || rating < 0 || rating > 10) {
					return res
						.status(400)
						.json({ error: "Rating must be a number between 0 and 10" });
				}
				body.rating = rating; // Ensure it's an integer
			}

			if (body.play_count !== undefined) {
				const playCount = parseInt(body.play_count);
				if (isNaN(playCount) || playCount < 0 || playCount > 10000) {
					return res
						.status(400)
						.json({ error: "Play count must be a number between 0 and 10000" });
				}
				body.play_count = playCount;
			}

			// Review text validation (length and content)
			if (body.review) {
				if (body.review.length > 2000) {
					return res
						.status(400)
						.json({ error: "Review must be less than 2000 characters" });
				}
				// Remove potential script tags and sanitize
				body.review = validator.escape(body.review);
			}

			next();
		} catch (error) {
			console.error("User input validation failed:", error.message);
			return res.status(400).json({ error: "Invalid input provided" });
		}
	}

	/**
	 * Database connection security wrapper
	 */
	static async secureDBQuery(db, queryFile, params = []) {
		try {
			// Log query execution (without sensitive data)
			if (process.env.NODE_ENV === "development") {
				console.log(`🔍 Executing query: ${queryFile}`);
			}

			// Validate parameters
			const sanitizedParams = params.map((param) => {
				if (typeof param === "string") {
					// Basic sanitization (parameterized queries handle most of this)
					return param.trim().substring(0, 1000); // Limit length
				}
				return param;
			});

			// Execute with timeout
			const queryTimeout = 10000; // 10 seconds
			const result = await Promise.race([
				db[queryFile](...sanitizedParams),
				new Promise((_, reject) =>
					setTimeout(() => reject(new Error("Query timeout")), queryTimeout)
				),
			]);

			return result;
		} catch (error) {
			console.error(`Database query error in ${queryFile}:`, error.message);
			throw new Error("Database operation failed");
		}
	}

	/**
	 * Check password strength
	 */
	static isStrongPassword(password) {
		return validator.isStrongPassword(password, {
			minLength: 8,
			minLowercase: 1,
			minUppercase: 1,
			minNumbers: 1,
			minSymbols: 1,
		});
	}

	/**
	 * Rate limiting for sensitive operations
	 */
	static createRateLimit(options = {}) {
		const attempts = new Map();

		return (req, res, next) => {
			const key = req.ip + (req.user?.user_id || "");
			const now = Date.now();
			const windowMs = options.windowMs || 900000; // 15 minutes
			const maxAttempts = options.maxAttempts || 5;

			// Clean old attempts
			for (const [k, data] of attempts.entries()) {
				if (now - data.firstAttempt > windowMs) {
					attempts.delete(k);
				}
			}

			const userAttempts = attempts.get(key);

			if (!userAttempts) {
				attempts.set(key, { count: 1, firstAttempt: now });
				return next();
			}

			if (userAttempts.count >= maxAttempts) {
				const timeLeft = Math.ceil(
					(windowMs - (now - userAttempts.firstAttempt)) / 1000 / 60
				);
				return res.status(429).json({
					error: "Too many attempts",
					message: `Please try again in ${timeLeft} minutes`,
				});
			}

			userAttempts.count++;
			next();
		};
	}

	/**
	 * Audit logging for sensitive operations
	 */
	static auditLog(action) {
		return (req, res, next) => {
			const logData = {
				timestamp: new Date().toISOString(),
				action,
				userId: req.session?.user?.user_id || "anonymous",
				ip: req.ip,
				userAgent: req.get("User-Agent"),
				method: req.method,
				url: req.originalUrl,
			};

			// In production, send to logging service
			if (process.env.NODE_ENV === "production") {
				console.log("AUDIT:", JSON.stringify(logData));
			} else {
				console.log(
					"🔍 AUDIT:",
					action,
					`User: ${logData.userId}`,
					`IP: ${logData.ip}`
				);
			}

			next();
		};
	}
}

module.exports = SQLSecurityMiddleware;
