import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
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
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ["react", "react-dom"],
					router: ["react-router-dom"],
					redux: ["@reduxjs/toolkit", "react-redux"],
					utils: ["axios", "react-toastify"],
					chart: ["chart.js"],
					ui: ["html-react-parser"],
				},
			},
		},
		chunkSizeWarningLimit: 600, // Increase limit slightly for main app chunk
	},
	define: {
		// Only expose specific environment variables that are safe for client-side
		"process.env.NODE_ENV": JSON.stringify(
			process.env.NODE_ENV || "development"
		),
		"process.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL || ""),
	},
});
