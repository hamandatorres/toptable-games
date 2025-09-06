const rateLimit = require("express-rate-limit");

/**
 * Rate limiting configurations for different endpoints
 * Provides protection against brute force attacks
 */

/**
 * Strict rate limiting for authentication endpoints
 * 5 attempts per 15 minutes per IP
 */
const authRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 5 requests per windowMs
	message: {
		error: "rate_limit_exceeded",
		message:
			"Too many authentication attempts. Please try again in 15 minutes.",
		retryAfter: 15 * 60, // seconds
	},
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	// Apply to login, register, and password reset
	skip: (req) => {
		// Skip rate limiting in development environment
		return (
			process.env.NODE_ENV === "development" &&
			process.env.SKIP_RATE_LIMIT === "true"
		);
	},
});

/**
 * General API rate limiting
 * 100 requests per 15 minutes per IP
 */
const generalRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	message: {
		error: "rate_limit_exceeded",
		message: "Too many requests. Please try again later.",
		retryAfter: 15 * 60, // seconds
	},
	standardHeaders: true,
	legacyHeaders: false,
	skip: (req) => {
		return (
			process.env.NODE_ENV === "development" &&
			process.env.SKIP_RATE_LIMIT === "true"
		);
	},
});

/**
 * Password reset rate limiting
 * 3 attempts per hour per IP
 */
const passwordResetRateLimit = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 3, // Limit each IP to 3 password reset requests per hour
	message: {
		error: "rate_limit_exceeded",
		message: "Too many password reset attempts. Please try again in 1 hour.",
		retryAfter: 60 * 60, // seconds
	},
	standardHeaders: true,
	legacyHeaders: false,
	skip: (req) => {
		return (
			process.env.NODE_ENV === "development" &&
			process.env.SKIP_RATE_LIMIT === "true"
		);
	},
});

module.exports = {
	authRateLimit,
	generalRateLimit,
	passwordResetRateLimit,
};
