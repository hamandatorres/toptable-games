import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	css: {
		preprocessorOptions: {
			scss: {
				// Explicitly use sass implementation
				implementation: require("sass"),
			},
		},
	},
	server: {
		port: 3000,
		host: true, // Needed for Docker
		proxy: {
			"/api": {
				target: "http://localhost:4050",
				changeOrigin: true,
				secure: false,
			},
		},
	},
	build: {
		outDir: "dist",
		sourcemap: false,
		minify: "terser",
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ["react", "react-dom"],
					router: ["react-router-dom"],
					redux: ["@reduxjs/toolkit", "react-redux"],
					utils: [
						"axios",
						"react-toastify",
						"dompurify",
						"isomorphic-dompurify",
					],
					// Separate chart.js into its own chunk for lazy loading
					chart: ["chart.js"],
					// Keep UI components in their own chunk
					ui: ["html-react-parser"],
				},
			},
		},
		chunkSizeWarningLimit: 500, // More strict warning limit
	},
	define: {
		// Only expose specific environment variables that are safe for client-side
		"process.env.NODE_ENV": JSON.stringify(
			process.env.NODE_ENV || "development"
		),
		"process.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL || ""),
	},
	// Performance optimizations
	optimizeDeps: {
		include: [
			"react",
			"react-dom",
			"react-router-dom",
			"@reduxjs/toolkit",
			"react-redux",
			"axios",
		],
		exclude: ["chart.js"], // Exclude from pre-bundling since it's lazy loaded
	},
});
