import { describe, it, expect } from "vitest";
import XSSProtection from "./xssProtection";

describe("XSSProtection", () => {
	describe("sanitizeHTML", () => {
		it("should return a string when given valid input", () => {
			const result = XSSProtection.sanitizeHTML("<p>Safe content</p>");
			expect(typeof result).toBe("string");
		});

		it("should handle empty input", () => {
			expect(XSSProtection.sanitizeHTML("")).toBe("");
		});

		it("should handle null/undefined input safely", () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			expect(XSSProtection.sanitizeHTML(null as any)).toBe("");
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			expect(XSSProtection.sanitizeHTML(undefined as any)).toBe("");
		});
	});

	describe("sanitizeText", () => {
		it("should encode HTML entities", () => {
			const maliciousText = '<script>alert("XSS")</script>';
			const sanitized = XSSProtection.sanitizeText(maliciousText);
			expect(sanitized).toContain("&lt;script&gt;");
			expect(sanitized).toContain("&quot;");
		});

		it("should preserve regular text", () => {
			const regularText = "This is normal text with numbers 123 and symbols!";
			const sanitized = XSSProtection.sanitizeText(regularText);
			expect(sanitized).toBe(regularText);
		});

		it("should handle empty input", () => {
			expect(XSSProtection.sanitizeText("")).toBe("");
		});
	});

	describe("sanitizeURL", () => {
		it("should allow safe HTTP URLs", () => {
			const safeURL = "https://www.example.com/path?param=value";
			const sanitized = XSSProtection.sanitizeURL(safeURL);
			expect(sanitized).toBe(safeURL);
		});

		it("should block javascript: URLs", () => {
			const maliciousURL = "javascript:alert('XSS')";
			const sanitized = XSSProtection.sanitizeURL(maliciousURL);
			expect(sanitized).toBe("");
		});

		it("should block data: URLs with script content", () => {
			const maliciousURL = "data:text/html,<script>alert('XSS')</script>";
			const sanitized = XSSProtection.sanitizeURL(maliciousURL);
			expect(sanitized).toBe("");
		});

		it("should allow relative URLs", () => {
			const relativeURL = "/path/to/resource";
			const sanitized = XSSProtection.sanitizeURL(relativeURL);
			expect(sanitized).toBe(relativeURL);
		});

		it("should handle empty input", () => {
			expect(XSSProtection.sanitizeURL("")).toBe("");
		});
	});

	describe("validateInput", () => {
		it("should reject input with script tags", () => {
			const maliciousInput = 'Hello <script>alert("XSS")</script> World';
			const result = XSSProtection.validateInput(maliciousInput);
			expect(result).toBe(false);
		});

		it("should accept safe input", () => {
			const safeInput = "This is a safe input with normal text.";
			const result = XSSProtection.validateInput(safeInput);
			expect(result).toBe(true);
		});

		it("should handle empty input", () => {
			const result = XSSProtection.validateInput("");
			expect(result).toBe(true);
		});

		it("should validate email format", () => {
			expect(XSSProtection.validateInput("test@example.com", "email")).toBe(
				true
			);
			expect(XSSProtection.validateInput("invalid-email", "email")).toBe(false);
		});

		it("should validate username format", () => {
			expect(XSSProtection.validateInput("validUser123", "username")).toBe(
				true
			);
			expect(XSSProtection.validateInput("user@name", "username")).toBe(false);
		});
	});
});
