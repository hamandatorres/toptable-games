/**
 * XSS Protection Middleware for Express.js
 * Server-side protection against Cross-Site Scripting attacks
 */

const DOMPurify = require("isomorphic-dompurify");

class XSSProtectionMiddleware {
	/**
	 * Middleware to sanitize all incoming request data
	 */
	static sanitizeRequest(req, res, next) {
		try {
			// Sanitize request body
			if (req.body && typeof req.body === "object") {
				req.body = XSSProtectionMiddleware.sanitizeObject(req.body);
			}

			// Sanitize query parameters
			if (req.query && typeof req.query === "object") {
				req.query = XSSProtectionMiddleware.sanitizeObject(req.query);
			}

			// Sanitize URL parameters
			if (req.params && typeof req.params === "object") {
				req.params = XSSProtectionMiddleware.sanitizeObject(req.params);
			}

			next();
		} catch (error) {
			console.error("XSS Protection error:", error.message);
			return res.status(400).json({
				error: "Invalid input detected",
				message: "Request contains potentially unsafe content",
			});
		}
	}

	/**
	 * Recursively sanitize object properties
	 */
	static sanitizeObject(obj) {
		if (obj === null || obj === undefined) {
			return obj;
		}

		if (Array.isArray(obj)) {
			return obj.map((item) => XSSProtectionMiddleware.sanitizeObject(item));
		}

		if (typeof obj === "object") {
			const sanitized = {};
			for (const [key, value] of Object.entries(obj)) {
				const sanitizedKey = XSSProtectionMiddleware.sanitizeString(key);
				sanitized[sanitizedKey] = XSSProtectionMiddleware.sanitizeObject(value);
			}
			return sanitized;
		}

		if (typeof obj === "string") {
			return XSSProtectionMiddleware.sanitizeString(obj);
		}

		return obj;
	}

	/**
	 * Sanitize string input
	 */
	static sanitizeString(input) {
		if (typeof input !== "string") {
			return input;
		}

		// Remove null bytes and control characters
		let sanitized = input.replace(/[\0-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

		// Check for XSS patterns and reject if found
		const xssPatterns = [
			/<script[^>]*>.*?<\/script>/gi,
			/javascript:/gi,
			/vbscript:/gi,
			/onload\s*=/gi,
			/onerror\s*=/gi,
			/onclick\s*=/gi,
			/onmouseover\s*=/gi,
			/onfocus\s*=/gi,
			/onblur\s*=/gi,
			/onchange\s*=/gi,
			/onsubmit\s*=/gi,
			/<iframe/gi,
			/<object/gi,
			/<embed/gi,
			/<link/gi,
			/<meta/gi,
			/<style/gi,
			/expression\s*\(/gi,
			/@import/gi,
			/\beval\s*\(/gi,
			/\bsetTimeout\s*\(/gi,
			/\bsetInterval\s*\(/gi,
		];

		for (const pattern of xssPatterns) {
			if (pattern.test(sanitized)) {
				console.warn(
					`🚨 XSS attempt detected: ${sanitized.substring(0, 100)}...`
				);
				throw new Error("Potentially malicious content detected");
			}
		}

		// HTML encode dangerous characters
		sanitized = sanitized
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#x27;")
			.replace(/\//g, "&#x2F;");

		// Limit length to prevent DoS
		sanitized = sanitized.substring(0, 10000);

		return sanitized.trim();
	}

	/**
	 * Sanitize HTML content using DOMPurify
	 */
	static sanitizeHTML(dirty) {
		if (typeof dirty !== "string") {
			return "";
		}

		const clean = DOMPurify.sanitize(dirty, {
			ALLOWED_TAGS: [
				"p",
				"br",
				"strong",
				"em",
				"u",
				"i",
				"b",
				"ul",
				"ol",
				"li",
				"h1",
				"h2",
				"h3",
				"h4",
				"h5",
				"h6",
				"blockquote",
				"div",
				"span",
			],
			ALLOWED_ATTR: ["class", "id"],
			ALLOW_DATA_ATTR: false,
			ALLOW_UNKNOWN_PROTOCOLS: false,
			FORBID_TAGS: [
				"script",
				"object",
				"embed",
				"link",
				"style",
				"form",
				"input",
				"button",
				"textarea",
				"select",
				"option",
				"iframe",
				"frame",
				"frameset",
				"meta",
				"title",
			],
			FORBID_ATTR: [
				"onerror",
				"onload",
				"onclick",
				"onmouseover",
				"onmouseout",
				"onfocus",
				"onblur",
				"onchange",
				"onsubmit",
				"onreset",
				"onkeydown",
				"onkeyup",
				"onkeypress",
				"style",
				"href",
				"src",
			],
		});

		return clean;
	}

	/**
	 * Validate specific input types
	 */
	static validateInputType(value, type) {
		if (typeof value !== "string") {
			return false;
		}

		switch (type) {
			case "email":
				const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
				return emailRegex.test(value) && value.length <= 100;

			case "username":
				const usernameRegex = /^[a-zA-Z0-9_-]+$/;
				return (
					usernameRegex.test(value) && value.length >= 3 && value.length <= 30
				);

			case "name":
				const nameRegex = /^[a-zA-Z\s'-]+$/;
				return nameRegex.test(value) && value.length <= 50;

			case "password":
				// Allow most characters for passwords but check for obvious XSS
				const passwordXSSRegex = /<[^>]*>|javascript:|vbscript:/gi;
				return (
					!passwordXSSRegex.test(value) &&
					value.length >= 8 &&
					value.length <= 128
				);

			case "url":
				try {
					const url = new URL(value);
					return ["http:", "https:"].includes(url.protocol);
				} catch {
					return false;
				}

			default:
				return value.length <= 1000;
		}
	}

	/**
	 * Enhanced Content Security Policy
	 */
	static setCSPHeaders(req, res, next) {
		const nonce = require("crypto").randomBytes(16).toString("base64");

		// Store nonce for use in templates
		res.locals.nonce = nonce;

		const csp = [
			"default-src 'self'",
			`script-src 'self' 'nonce-${nonce}' https://cdnjs.cloudflare.com`,
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
			"font-src 'self' https://fonts.gstatic.com",
			"img-src 'self' data: https: http:",
			"connect-src 'self'",
			"frame-src 'none'",
			"object-src 'none'",
			"base-uri 'self'",
			"form-action 'self'",
			"frame-ancestors 'none'",
			"upgrade-insecure-requests",
		].join("; ");

		res.setHeader("Content-Security-Policy", csp);
		next();
	}

	/**
	 * Additional XSS protection headers
	 */
	static setXSSHeaders(req, res, next) {
		// X-XSS-Protection header
		res.setHeader("X-XSS-Protection", "1; mode=block");

		// X-Content-Type-Options
		res.setHeader("X-Content-Type-Options", "nosniff");

		// X-Frame-Options
		res.setHeader("X-Frame-Options", "DENY");

		// Referrer Policy
		res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

		// Remove server information
		res.removeHeader("X-Powered-By");

		next();
	}

	/**
	 * Rate limiting for security endpoints
	 */
	static createSecurityRateLimit() {
		const rateLimit = require("express-rate-limit");

		return rateLimit({
			windowMs: 15 * 60 * 1000, // 15 minutes
			max: 5, // limit each IP to 5 requests per windowMs
			message: {
				error: "Too many security-related requests",
				message: "Please try again later",
			},
			standardHeaders: true,
			legacyHeaders: false,
		});
	}
}

module.exports = XSSProtectionMiddleware;
