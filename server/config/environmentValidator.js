/**
 * Environment Variable Validation and Security
 * Validates required environment variables and applies security defaults
 */

const crypto = require("crypto");

class EnvironmentValidator {
	constructor() {
		this.errors = [];
		this.warnings = [];
	}

	/**
	 * Validates all required environment variables
	 */
	validate() {
		this.validateNodeEnv();
		this.validateDatabase();
		this.validateSession();
		this.validateSecurity();
		this.validateEmail();

		if (this.errors.length > 0) {
			console.error("❌ Environment Validation Failed:");
			this.errors.forEach((error) => console.error(`  - ${error}`));
			process.exit(1);
		}

		if (this.warnings.length > 0) {
			console.warn("⚠️  Environment Warnings:");
			this.warnings.forEach((warning) => console.warn(`  - ${warning}`));
		}

		console.log("✅ Environment validation passed");
		return this.getSecureConfig();
	}

	validateNodeEnv() {
		const nodeEnv = process.env.NODE_ENV;
		if (!nodeEnv) {
			this.errors.push("NODE_ENV is required");
		} else if (!["development", "production", "test"].includes(nodeEnv)) {
			this.errors.push("NODE_ENV must be development, production, or test");
		}
	}

	validateDatabase() {
		const connectionString = process.env.CONNECTION_STRING;
		if (!connectionString) {
			this.errors.push("CONNECTION_STRING is required");
		} else {
			// Check for SSL in production
			if (
				process.env.NODE_ENV === "production" &&
				!connectionString.includes("sslmode=require")
			) {
				this.warnings.push("DATABASE: SSL should be enabled in production");
			}

			// Check for default passwords
			if (
				connectionString.includes(":postgres@") ||
				connectionString.includes(":password@")
			) {
				this.warnings.push(
					"DATABASE: Using default credentials, change for production"
				);
			}
		}

		// Validate connection pool settings
		const poolMax = parseInt(process.env.DB_POOL_MAX) || 10;
		if (poolMax > 50) {
			this.warnings.push(
				"DATABASE: Pool max connections seems high, consider reducing"
			);
		}
	}

	validateSession() {
		const sessionSecret = process.env.SESSION_SECRET;
		if (!sessionSecret) {
			this.errors.push("SESSION_SECRET is required");
		} else {
			// Check session secret strength
			if (sessionSecret.length < 32) {
				this.errors.push("SESSION_SECRET must be at least 32 characters long");
			}

			if (
				sessionSecret.includes("fallback") ||
				sessionSecret.includes("change-me")
			) {
				this.errors.push("SESSION_SECRET must be changed from default value");
			}

			// Entropy check (basic)
			const uniqueChars = new Set(sessionSecret).size;
			if (uniqueChars < 16) {
				this.warnings.push("SESSION_SECRET appears to have low entropy");
			}
		}
	}

	validateSecurity() {
		// bcrypt rounds
		const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
		if (bcryptRounds < 12 && process.env.NODE_ENV === "production") {
			this.warnings.push("SECURITY: bcrypt rounds should be 12+ in production");
		}

		// Rate limiting
		if (
			!process.env.RATE_LIMIT_MAX_REQUESTS &&
			process.env.NODE_ENV === "production"
		) {
			this.warnings.push(
				"SECURITY: Rate limiting not configured for production"
			);
		}
	}

	validateEmail() {
		const emailUser = process.env.EMAIL_USER;
		const emailPassword = process.env.EMAIL_PASSWORD;

		if (emailUser && !emailPassword) {
			this.errors.push("EMAIL_PASSWORD is required when EMAIL_USER is set");
		}

		if (emailPassword && emailPassword.length < 16) {
			this.warnings.push(
				"EMAIL: Consider using app-specific passwords for better security"
			);
		}
	}

	/**
	 * Returns secure configuration object with validated values
	 */
	getSecureConfig() {
		return {
			// Application
			nodeEnv: process.env.NODE_ENV,
			serverPort: parseInt(process.env.SERVER_PORT) || 4050,

			// Database
			connectionString: process.env.CONNECTION_STRING,
			dbPoolMin: parseInt(process.env.DB_POOL_MIN) || 2,
			dbPoolMax: parseInt(process.env.DB_POOL_MAX) || 10,
			dbIdleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
			dbConnectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,

			// Session
			sessionSecret: process.env.SESSION_SECRET,
			sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000, // 24 hours
			sessionSecure:
				process.env.SESSION_SECURE === "true" ||
				process.env.NODE_ENV === "production",
			sessionHttpOnly: process.env.SESSION_HTTP_ONLY !== "false",
			sessionSameSite: process.env.SESSION_SAME_SITE || "lax",

			// Security
			bcryptRounds:
				parseInt(process.env.BCRYPT_ROUNDS) ||
				(process.env.NODE_ENV === "production" ? 12 : 10),
			rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
			rateLimitMaxRequests:
				parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
			rateLimitLoginMax: parseInt(process.env.RATE_LIMIT_LOGIN_MAX) || 5,
			rateLimitLoginWindow:
				parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW) || 900000,

			// CORS
			corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
			corsCredentials: process.env.CORS_CREDENTIALS !== "false",

			// Email
			email: {
				service: process.env.EMAIL_SERVICE || "gmail",
				host: process.env.EMAIL_HOST || "smtp.gmail.com",
				port: parseInt(process.env.EMAIL_PORT) || 587,
				secure: process.env.EMAIL_SECURE === "true",
				user: process.env.EMAIL_USER,
				password: process.env.EMAIL_PASSWORD,
				fromName: process.env.EMAIL_FROM_NAME || "TopTable Games",
				fromAddress: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER,
			},

			// Password Reset
			resetTokenExpires: parseInt(process.env.RESET_TOKEN_EXPIRES) || 3600000, // 1 hour
			resetTokenLength: parseInt(process.env.RESET_TOKEN_LENGTH) || 32,

			// File Upload
			maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
			allowedFileTypes: (
				process.env.ALLOWED_FILE_TYPES || "jpg,jpeg,png,gif"
			).split(","),
			uploadPath: process.env.UPLOAD_PATH || "./uploads",
		};
	}

	/**
	 * Generates a secure session secret if none exists
	 */
	static generateSessionSecret() {
		return crypto.randomBytes(64).toString("hex");
	}

	/**
	 * Checks if running in secure environment
	 */
	static isSecureEnvironment() {
		return (
			process.env.NODE_ENV === "production" || process.env.FORCE_SSL === "true"
		);
	}
}

module.exports = EnvironmentValidator;
