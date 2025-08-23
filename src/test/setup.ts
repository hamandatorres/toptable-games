import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
	cleanup();
});

// Extend Vitest's expect with jest-dom matchers
expect.extend({});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => {},
	}),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};

// Mock Chart.js (if needed)
window.HTMLCanvasElement.prototype.getContext = () => null;
