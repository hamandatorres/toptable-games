/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "happy-dom",
		setupFiles: ["./src/test/setup.ts"],
		css: true,
		reporters: ["verbose"],
		coverage: {
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"src/test/",
				"**/*.d.ts",
				"**/*.config.*",
				"dist/",
				"server/",
			],
		},
		include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		exclude: ["node_modules", "dist", ".idea", ".git", ".cache", "server"],
	},
	define: {
		// Only expose specific environment variables that are safe for client-side
		"process.env.NODE_ENV": JSON.stringify(
			process.env.NODE_ENV || "development"
		),
		"process.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL || ""),
	},
});
