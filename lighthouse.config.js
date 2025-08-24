module.exports = {
	ci: {
		collect: {
			url: ["http://localhost:4050"],
			startServerCommand: "npm run start",
			startServerReadyPattern: "Server is running",
			startServerReadyTimeout: 60000,
		},
		assert: {
			assertions: {
				"categories:performance": ["error", { minScore: 0.8 }],
				"categories:accessibility": ["error", { minScore: 0.9 }],
				"categories:best-practices": ["error", { minScore: 0.8 }],
				"categories:seo": ["error", { minScore: 0.8 }],
				"first-contentful-paint": ["error", { maxNumericValue: 2000 }],
				"largest-contentful-paint": ["error", { maxNumericValue: 3000 }],
				"cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
				"first-meaningful-paint": ["error", { maxNumericValue: 2500 }],
				interactive: ["error", { maxNumericValue: 4000 }],
				"uses-webp-images": "off", // We'll handle image optimization separately
				"unused-javascript": ["warn", { maxLength: 20 }],
				"render-blocking-resources": "warn",
			},
		},
		upload: {
			target: "temporary-public-storage",
		},
	},
};
