/**
 * XSS Protection Utilities
 * Comprehensive protection against Cross-Site Scripting attacks
 */

import React from "react";
import DOMPurify from "isomorphic-dompurify";

export class XSSProtection {
	/**
	 * Sanitize HTML content to prevent XSS attacks
	 */
	static sanitizeHTML(dirty: string): string {
		if (typeof dirty !== "string") {
			return "";
		}

		// Configure DOMPurify with strict settings
		const cleanHTML = DOMPurify.sanitize(dirty, {
			// Remove all scripts and potentially dangerous elements
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
			// Remove dangerous attributes
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
				"formaction",
				"form",
				"formenctype",
				"formmethod",
				"formnovalidate",
				"formtarget",
				"action",
				"method",
				"enctype",
				"target",
			],
			// Only allow safe attributes
			ALLOWED_ATTR: [
				"href",
				"src",
				"alt",
				"title",
				"class",
				"id",
				"width",
				"height",
				"aria-label",
				"aria-describedby",
				"role",
				"tabindex",
			],
			// Only allow safe tags
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
				"a",
				"img",
				"table",
				"tr",
				"td",
				"th",
				"thead",
				"tbody",
			],
			// Additional security options
			ALLOW_DATA_ATTR: false,
			ALLOW_UNKNOWN_PROTOCOLS: false,
			RETURN_DOM: false,
			RETURN_DOM_FRAGMENT: false,
			RETURN_TRUSTED_TYPE: false,
			SANITIZE_DOM: true,
			KEEP_CONTENT: false,
			// Remove any javascript: or data: URLs
			ALLOWED_URI_REGEXP:
				/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
		});

		return cleanHTML;
	}

	/**
	 * Sanitize plain text input (for form inputs, etc.)
	 */
	static sanitizeText(input: string): string {
		if (typeof input !== "string") {
			return "";
		}

		// Remove null bytes and control characters
		// eslint-disable-next-line no-control-regex
		let sanitized = input.replace(/[\0-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

		// Escape HTML entities
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
	 * Validate and sanitize URLs
	 */
	static sanitizeURL(url: string): string {
		if (typeof url !== "string") {
			return "";
		}

		// Remove dangerous protocols
		const dangerousProtocols = [
			"javascript:",
			"data:",
			"vbscript:",
			"file:",
			"about:",
			"chrome:",
			"chrome-extension:",
			"ms-its:",
			"ms-itss:",
			"its:",
			"mk:",
		];

		const lowerUrl = url.toLowerCase().trim();

		for (const protocol of dangerousProtocols) {
			if (lowerUrl.startsWith(protocol)) {
				return "";
			}
		}

		// Only allow http, https, mailto, tel protocols
		const allowedProtocolRegex = /^(https?|mailto|tel):/i;
		if (url.includes(":") && !allowedProtocolRegex.test(url)) {
			return "";
		}

		return DOMPurify.sanitize(url, {
			ALLOWED_TAGS: [],
			ALLOWED_ATTR: [],
		});
	}

	/**
	 * Content Security Policy helpers
	 */
	static generateCSPNonce(): string {
		if (typeof window !== "undefined") {
			// Browser environment
			const array = new Uint8Array(16);
			window.crypto.getRandomValues(array);
			return Array.from(array, (byte) =>
				byte.toString(16).padStart(2, "0")
			).join("");
		} else {
			// Node.js environment - use dynamic import
			const crypto = eval("require")("crypto") as typeof import("crypto");
			return crypto.randomBytes(16).toString("hex");
		}
	}

	/**
	 * Input validation for common patterns
	 */
	static validateInput(
		input: string,
		type: "email" | "username" | "name" | "general" = "general"
	): boolean {
		if (typeof input !== "string") {
			return false;
		}

		// Check for common XSS patterns
		const xssPatterns = [
			/<script[^>]*>.*?<\/script>/gi,
			/javascript:/gi,
			/vbscript:/gi,
			/onload=/gi,
			/onerror=/gi,
			/onclick=/gi,
			/onmouseover=/gi,
			/onfocus=/gi,
			/onblur=/gi,
			/onchange=/gi,
			/onsubmit=/gi,
			/<iframe/gi,
			/<object/gi,
			/<embed/gi,
			/<link/gi,
			/<meta/gi,
			/<style/gi,
			/expression\(/gi,
			/url\(/gi,
			/@import/gi,
			/\beval\(/gi,
			/\bsetTimeout\(/gi,
			/\bsetInterval\(/gi,
		];

		for (const pattern of xssPatterns) {
			if (pattern.test(input)) {
				return false;
			}
		}

		// Type-specific validation
		switch (type) {
			case "email": {
				const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
				return emailRegex.test(input) && input.length <= 100;
			}

			case "username": {
				const usernameRegex = /^[a-zA-Z0-9_-]+$/;
				return (
					usernameRegex.test(input) && input.length >= 3 && input.length <= 30
				);
			}

			case "name": {
				const nameRegex = /^[a-zA-Z\s'-]+$/;
				return nameRegex.test(input) && input.length <= 50;
			}

			case "general":
			default:
				return input.length <= 1000;
		}
	}

	/**
	 * React component wrapper for safe HTML rendering
	 */
	static SafeHTML: React.FC<{ html: string; className?: string }> = ({
		html,
		className,
	}) => {
		const sanitizedHTML = XSSProtection.sanitizeHTML(html);

		return React.createElement("div", {
			className,
			dangerouslySetInnerHTML: { __html: sanitizedHTML },
		});
	};
}

// Export for backwards compatibility
export const sanitizeHTML = XSSProtection.sanitizeHTML;
export const sanitizeText = XSSProtection.sanitizeText;
export const sanitizeURL = XSSProtection.sanitizeURL;
export const validateInput = XSSProtection.validateInput;

export default XSSProtection;
