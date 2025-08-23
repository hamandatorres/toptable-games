/**
 * Security Configuration and Middleware Setup
 * Implements comprehensive security measures for the application
 */

const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const SQLSecurityMiddleware = require("../middleware/sqlSecurityMiddleware");

class SecurityConfig {
	static configureSecurityMiddleware(app, config) {
		// 1. Helmet for security headers
		app.use(
			helmet({
				contentSecurityPolicy: {
					directives: {
						defaultSrc: ["'self'"],
						styleSrc: [
							"'self'",
							"'unsafe-inline'",
							"https://fonts.googleapis.com",
						],
						fontSrc: ["'self'", "https://fonts.gstatic.com"],
						imgSrc: ["'self'", "data:", "https:", "http:"],
						scriptSrc: ["'self'"],
						connectSrc: ["'self'"],
					},
				},
				hsts: {
					maxAge: config.securityHstsMaxAge || 31536000,
					includeSubDomains: true,
					preload: true,
				},
			})
		);

		// 2. CORS configuration
		app.use(
			cors({
				origin: config.corsOrigin,
				credentials: config.corsCredentials,
				methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
				allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
			})
		);

		// 3. General rate limiting
		const generalLimiter = rateLimit({
			windowMs: config.rateLimitWindowMs,
			max: config.rateLimitMaxRequests,
			message: {
				error: "Too many requests",
				message: "Please slow down and try again later",
			},
			standardHeaders: true,
			legacyHeaders: false,
		});
		app.use(generalLimiter);

		// 4. Strict rate limiting for authentication endpoints
		const authLimiter = rateLimit({
			windowMs: config.rateLimitLoginWindow,
			max: config.rateLimitLoginMax,
			message: {
				error: "Too many login attempts",
				message: "Please try again later",
			},
			skipSuccessfulRequests: true,
		});

		// Apply auth rate limiting to specific routes
		app.use("/auth/login", authLimiter);
		app.use("/auth/register", authLimiter);
		app.use("/auth/password-reset", authLimiter);

		// 5. SQL injection prevention
		app.use(SQLSecurityMiddleware.validateInput);
		app.use("/auth", SQLSecurityMiddleware.validateUserInput);
		app.use("/api/usergames", SQLSecurityMiddleware.validateUserInput);
		app.use("/api/userinfo", SQLSecurityMiddleware.validateUserInput);

		// 6. Request size limiting
		app.use(
			express.json({
				limit: "10mb",
				verify: (req, res, buf) => {
					// Check for suspicious payloads
					const body = buf.toString();
					if (body.includes("<script") || body.includes("javascript:")) {
						throw new Error("Suspicious payload detected");
					}
				},
			})
		);

		// 7. Additional security headers
		app.use((req, res, next) => {
			res.setHeader("X-Content-Type-Options", "nosniff");
			res.setHeader("X-Frame-Options", "DENY");
			res.setHeader("X-XSS-Protection", "1; mode=block");
			res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
			res.removeHeader("X-Powered-By");
			next();
		});

		console.log("✅ Security middleware configured");
	}

	/**
	 * Database security configuration
	 */
	static configureDatabaseSecurity(massive, config) {
		const dbConfig = {
			connectionString: config.connectionString,
			poolSize: config.dbPoolMax,
			poolIdleTimeout: config.dbIdleTimeout,
			connectionTimeoutMillis: config.dbConnectionTimeout,
			ssl:
				config.nodeEnv === "production" ? { rejectUnauthorized: false } : false,
			application_name: "toptable_games_app",
			// Additional security settings
			statement_timeout: 30000, // 30 seconds
			query_timeout: 30000,
			connectionTimeoutMillis: 5000,
		};

		return massive(dbConfig)
			.then((db) => {
				console.log("✅ Database connected with security settings");

				// Wrap database queries with security middleware
				const originalQuery = db.query;
				db.query = function (sql, params) {
					// Log query execution in development
					if (config.nodeEnv === "development") {
						console.log("🔍 DB Query:", sql.substring(0, 100) + "...");
					}
					return originalQuery.call(this, sql, params);
				};

				return db;
			})
			.catch((err) => {
				console.error("❌ Database connection failed:", err.message);
				process.exit(1);
			});
	}

	/**
	 * Session security configuration
	 */
	static getSessionConfig(config) {
		return {
			secret: config.sessionSecret,
			resave: false,
			saveUninitialized: false,
			name: "ttg.sid", // Don't use default session name
			cookie: {
				maxAge: config.sessionMaxAge,
				secure: config.sessionSecure,
				httpOnly: config.sessionHttpOnly,
				sameSite: config.sessionSameSite,
			},
			// Additional security options
			rolling: true, // Reset expiration on activity
			proxy: config.nodeEnv === "production",
		};
	}

	/**
	 * Input sanitization helpers
	 */
	static sanitizeInput(input) {
		if (typeof input !== "string") return input;

		// Remove null bytes
		let sanitized = input.replace(/\0/g, "");

		// Limit length
		sanitized = sanitized.substring(0, 1000);

		// Trim whitespace
		sanitized = sanitized.trim();

		return sanitized;
	}

	/**
	 * Password validation
	 */
	static validatePassword(password) {
		const requirements = {
			minLength: 8,
			hasUppercase: /[A-Z]/.test(password),
			hasLowercase: /[a-z]/.test(password),
			hasNumbers: /\d/.test(password),
			hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
		};

		const isValid =
			password.length >= requirements.minLength &&
			requirements.hasUppercase &&
			requirements.hasLowercase &&
			requirements.hasNumbers &&
			requirements.hasSpecialChar;

		return {
			isValid,
			requirements,
			score: Object.values(requirements).filter(Boolean).length,
		};
	}

	/**
	 * Generate secure tokens
	 */
	static generateSecureToken(length = 32) {
		const crypto = require("crypto");
		return crypto.randomBytes(length).toString("hex");
	}

	/**
	 * Health check endpoint with security
	 */
	static healthCheck(req, res) {
		const healthData = {
			status: "healthy",
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			memory: process.memoryUsage(),
			// Don't expose sensitive information
		};

		res.status(200).json(healthData);
	}
}

module.exports = SecurityConfig;
