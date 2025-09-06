const rateLimit = require("express-rate-limit");

/**
 * Enhanced rate limiting with account lockout and progressive delays
 * Provides comprehensive protection against brute force attacks
 */

/**
 * Account lockout tracking using in-memory Map
 * Tracks failed login attempts per email/username
 */
const accountLockouts = new Map();
const LOCKOUT_THRESHOLD = 5; // Failed attempts before lockout
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const PROGRESSIVE_DELAY = 2000; // 2 seconds base delay

/**
 * Check if account is locked out
 */
const isAccountLocked = (identifier) => {
	const lockout = accountLockouts.get(identifier);
	if (!lockout) return false;

	// Check if lockout has expired
	if (Date.now() > lockout.lockedUntil) {
		accountLockouts.delete(identifier);
		return false;
	}

	return true;
};

/**
 * Record failed login attempt
 */
const recordFailedAttempt = (identifier) => {
	const now = Date.now();
	const existing = accountLockouts.get(identifier) || {
		attempts: 0,
		firstAttempt: now,
	};

	existing.attempts++;
	existing.lastAttempt = now;

	// If threshold reached, lock the account
	if (existing.attempts >= LOCKOUT_THRESHOLD) {
		existing.lockedUntil = now + LOCKOUT_DURATION;
		console.log(
			`🔒 Account locked: ${identifier} - ${existing.attempts} failed attempts`
		);
	}

	accountLockouts.set(identifier, existing);

	// Clean up old entries (older than 1 hour)
	const oneHourAgo = now - 60 * 60 * 1000;
	for (const [key, value] of accountLockouts.entries()) {
		if (value.firstAttempt < oneHourAgo && !value.lockedUntil) {
			accountLockouts.delete(key);
		}
	}

	return existing;
};

/**
 * Clear failed attempts on successful login
 */
const clearFailedAttempts = (identifier) => {
	accountLockouts.delete(identifier);
};

/**
 * Get progressive delay based on failed attempts
 */
const getProgressiveDelay = (attempts) => {
	return Math.min(PROGRESSIVE_DELAY * Math.pow(2, attempts - 1), 30000); // Max 30 seconds
};

/**
 * Middleware to check account lockout before rate limiting
 */
const accountLockoutMiddleware = (req, res, next) => {
	// Only apply to login attempts
	if (req.route?.path !== "/api/auth/login") {
		return next();
	}

	const identifier =
		req.body?.userCreds || req.body?.email || req.body?.username;
	if (!identifier) {
		return next();
	}

	const lockout = accountLockouts.get(identifier.toLowerCase());

	// Check if account is locked
	if (isAccountLocked(identifier.toLowerCase())) {
		const timeRemaining = Math.ceil(
			(lockout.lockedUntil - Date.now()) / 1000 / 60
		);
		return res.status(423).json({
			error: "account_locked",
			message: `Account temporarily locked due to too many failed login attempts. Try again in ${timeRemaining} minutes.`,
			lockedUntil: lockout.lockedUntil,
			attempts: lockout.attempts,
		});
	}

	// Apply progressive delay if there were previous failed attempts
	if (lockout && lockout.attempts > 1) {
		const delay = getProgressiveDelay(lockout.attempts);
		console.log(
			`⏱️  Progressive delay: ${delay}ms for ${identifier} (${lockout.attempts} attempts)`
		);
		setTimeout(() => next(), delay);
	} else {
		next();
	}
};

/**
 * Enhanced authentication rate limiter
 * More restrictive than basic rate limiting
 */
const enhancedAuthRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 8, // Slightly higher than basic (accounts for retries)
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		error: "rate_limit_exceeded",
		message:
			"Too many authentication attempts from this IP. Please try again in 15 minutes.",
		retryAfter: 15 * 60,
	},
	skip: (req) => {
		// Skip rate limiting in development if configured
		return (
			process.env.NODE_ENV === "development" &&
			process.env.SKIP_RATE_LIMIT === "true"
		);
	},
	// Custom key generator that includes both IP and user agent
	keyGenerator: (req) => {
		return `${req.ip}-${req.get("User-Agent") || "unknown"}`;
	},
});

/**
 * Suspicious activity detection
 * Tracks patterns that might indicate automated attacks
 */
const suspiciousActivityTracker = new Map();

const detectSuspiciousActivity = (req, res, next) => {
	const key = `${req.ip}-${req.get("User-Agent") || "unknown"}`;
	const now = Date.now();
	const activity = suspiciousActivityTracker.get(key) || {
		requests: [],
		firstSeen: now,
	};

	// Add current request
	activity.requests.push(now);
	activity.lastSeen = now;

	// Keep only requests from last hour
	const oneHourAgo = now - 60 * 60 * 1000;
	activity.requests = activity.requests.filter(
		(timestamp) => timestamp > oneHourAgo
	);

	// Check for suspicious patterns
	const requestCount = activity.requests.length;
	const timeSpan = now - (activity.requests[0] || now);

	// Flag as suspicious if:
	// - More than 20 requests in an hour
	// - Or more than 10 requests in 10 minutes
	const tenMinutesAgo = now - 10 * 60 * 1000;
	const recentRequests = activity.requests.filter(
		(timestamp) => timestamp > tenMinutesAgo
	);

	if (requestCount > 20 || recentRequests.length > 10) {
		console.log(
			`🚨 Suspicious activity detected from ${
				req.ip
			}: ${requestCount} requests in ${Math.round(timeSpan / 60000)} minutes`
		);

		// Enhanced rate limiting for suspicious IPs
		if (requestCount > 30) {
			return res.status(429).json({
				error: "suspicious_activity",
				message: "Suspicious activity detected. Access temporarily restricted.",
				retryAfter: 60 * 60, // 1 hour
			});
		}
	}

	suspiciousActivityTracker.set(key, activity);

	// Clean up old entries
	for (const [entryKey, entryActivity] of suspiciousActivityTracker.entries()) {
		if (entryActivity.lastSeen < oneHourAgo) {
			suspiciousActivityTracker.delete(entryKey);
		}
	}

	next();
};

/**
 * Password reset rate limiting
 * Even more restrictive for password reset requests
 */
const passwordResetRateLimit = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 3, // Only 3 password reset attempts per hour per IP
	message: {
		error: "rate_limit_exceeded",
		message: "Too many password reset attempts. Please try again in 1 hour.",
		retryAfter: 60 * 60,
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
 * API rate limiting with different tiers
 */
const createApiRateLimit = (maxRequests, windowMinutes = 15) => {
	return rateLimit({
		windowMs: windowMinutes * 60 * 1000,
		max: maxRequests,
		standardHeaders: true,
		legacyHeaders: false,
		message: {
			error: "rate_limit_exceeded",
			message: `Too many API requests. Maximum ${maxRequests} requests per ${windowMinutes} minutes.`,
			retryAfter: windowMinutes * 60,
		},
		skip: (req) => {
			return (
				process.env.NODE_ENV === "development" &&
				process.env.SKIP_RATE_LIMIT === "true"
			);
		},
	});
};

// Export rate limiting functions for use in auth controller
module.exports = {
	// Middleware
	accountLockoutMiddleware,
	enhancedAuthRateLimit,
	detectSuspiciousActivity,
	passwordResetRateLimit,
	createApiRateLimit,

	// Utility functions for auth controller
	isAccountLocked,
	recordFailedAttempt,
	clearFailedAttempts,
	getProgressiveDelay,

	// Legacy exports (keep for backwards compatibility)
	authRateLimit: enhancedAuthRateLimit,
	generalRateLimit: createApiRateLimit(100), // 100 requests per 15 minutes
};
