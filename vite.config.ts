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
					vendor: ["react", "react-dom", "react-router-dom"],
					redux: ["@reduxjs/toolkit", "react-redux"],
					utils: ["axios", "react-toastify"],
				},
			},
		},
	},
	define: {
		"process.env": process.env,
	},
});
