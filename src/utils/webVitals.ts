// Web Vitals monitoring for TopTable Games
// Tracks Core Web Vitals and reports performance metrics

import type { Metric } from "web-vitals";
import { onCLS, onINP, onFCP, onLCP, onTTFB } from "web-vitals";

// Performance reporting endpoint
const ANALYTICS_ENDPOINT = "/api/analytics/web-vitals";

interface WebVitalsMetric {
	name: string;
	value: number;
	rating: "good" | "needs-improvement" | "poor";
	delta: number;
	id: string;
	navigationType: string;
	timestamp: number;
	url: string;
	userAgent: string;
}

// Send metrics to analytics endpoint
async function sendToAnalytics(metric: WebVitalsMetric) {
	try {
		// Only send in production
		if (process.env.NODE_ENV !== "production") {
			console.log("📊 Web Vitals Metric:", metric);
			return;
		}

		await fetch(ANALYTICS_ENDPOINT, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(metric),
			keepalive: true, // Ensure request completes even if page unloads
		});
	} catch (error) {
		console.warn("Failed to send web vitals metric:", error);
	}
}

// Create standardized metric object
function createMetric(metric: Metric): WebVitalsMetric {
	return {
		name: metric.name,
		value: metric.value,
		rating: metric.rating,
		delta: metric.delta,
		id: metric.id,
		navigationType:
			(metric as Metric & { navigationType?: string }).navigationType ||
			"navigate",
		timestamp: Date.now(),
		url: window.location.href,
		userAgent: navigator.userAgent,
	};
}

// Performance observer for additional metrics
function observePerformance() {
	// Observe resource loading performance
	if ("PerformanceObserver" in window) {
		try {
			const resourceObserver = new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					if (entry.entryType === "resource") {
						const resource = entry as PerformanceResourceTiming;

						// Track slow resources (>1s load time)
						if (resource.responseEnd - resource.startTime > 1000) {
							console.warn("Slow resource detected:", {
								name: resource.name,
								duration: resource.responseEnd - resource.startTime,
								size: resource.transferSize,
								type: resource.initiatorType,
							});
						}
					}
				}
			});

			resourceObserver.observe({ entryTypes: ["resource"] });
		} catch (error) {
			console.warn("Could not observe resource performance:", error);
		}
	}
}

// Track custom performance metrics
export function trackCustomMetric(name: string, value: number, unit = "ms") {
	const metric = {
		name: `custom.${name}`,
		value,
		rating: "good" as const,
		delta: 0,
		id: `${name}-${Date.now()}`,
		navigationType: "navigate",
		timestamp: Date.now(),
		url: window.location.href,
		userAgent: navigator.userAgent,
	};

	sendToAnalytics(metric);

	// Log in development
	if (process.env.NODE_ENV !== "production") {
		console.log(`📈 Custom Metric: ${name} = ${value}${unit}`);
	}
}

// Track page load performance
export function trackPageLoad() {
	if ("performance" in window && "getEntriesByType" in performance) {
		const navigation = performance.getEntriesByType(
			"navigation"
		)[0] as PerformanceNavigationTiming;

		if (navigation) {
			// DNS lookup time
			const dnsTime = navigation.domainLookupEnd - navigation.domainLookupStart;
			trackCustomMetric("dns_lookup", dnsTime);

			// Connection time
			const connectionTime = navigation.connectEnd - navigation.connectStart;
			trackCustomMetric("connection", connectionTime);

			// Server response time
			const responseTime = navigation.responseEnd - navigation.requestStart;
			trackCustomMetric("server_response", responseTime);

			// DOM processing time
			const domTime =
				navigation.domComplete - navigation.domContentLoadedEventStart;
			trackCustomMetric("dom_processing", domTime);

			// Page load complete time
			const loadTime = navigation.loadEventEnd - navigation.fetchStart;
			trackCustomMetric("page_load_complete", loadTime);
		}
	}
}

// Initialize Web Vitals monitoring
export function initWebVitals() {
	console.log("🚀 Initializing Web Vitals monitoring...");

	// Track Core Web Vitals
	onCLS((metric: Metric) => sendToAnalytics(createMetric(metric)));
	onINP((metric: Metric) => sendToAnalytics(createMetric(metric))); // Replaces FID in web-vitals v5
	onFCP((metric: Metric) => sendToAnalytics(createMetric(metric)));
	onLCP((metric: Metric) => sendToAnalytics(createMetric(metric)));
	onTTFB((metric: Metric) => sendToAnalytics(createMetric(metric)));

	// Track additional performance metrics
	observePerformance();

	// Track page load when DOM is ready
	if (document.readyState === "complete") {
		trackPageLoad();
	} else {
		window.addEventListener("load", trackPageLoad);
	}
}

// Performance monitoring hooks for React components
export function usePerformanceMonitoring(componentName: string) {
	const startTime = performance.now();

	return {
		markRender: () => {
			const renderTime = performance.now() - startTime;
			trackCustomMetric(`component.${componentName}.render`, renderTime);
		},

		markMount: () => {
			const mountTime = performance.now() - startTime;
			trackCustomMetric(`component.${componentName}.mount`, mountTime);
		},

		markUpdate: () => {
			const updateTime = performance.now() - startTime;
			trackCustomMetric(`component.${componentName}.update`, updateTime);
		},
	};
}

// Bundle size tracking
export function trackBundleSize() {
	if ("PerformanceObserver" in window) {
		try {
			const resourceObserver = new PerformanceObserver((list) => {
				let totalJSSize = 0;
				let totalCSSSize = 0;

				for (const entry of list.getEntries()) {
					const resource = entry as PerformanceResourceTiming;

					if (resource.name.includes(".js")) {
						totalJSSize += resource.transferSize || 0;
					} else if (resource.name.includes(".css")) {
						totalCSSSize += resource.transferSize || 0;
					}
				}

				if (totalJSSize > 0) {
					trackCustomMetric("bundle.js_size", totalJSSize, "bytes");
				}

				if (totalCSSSize > 0) {
					trackCustomMetric("bundle.css_size", totalCSSSize, "bytes");
				}
			});

			resourceObserver.observe({ entryTypes: ["resource"] });
		} catch (error) {
			console.warn("Could not track bundle size:", error);
		}
	}
}

// Export default monitoring function
export default function startPerformanceMonitoring() {
	// Only run in browser environment
	if (typeof window === "undefined") return;

	initWebVitals();
	trackBundleSize();

	console.log("✅ Performance monitoring initialized");
}
