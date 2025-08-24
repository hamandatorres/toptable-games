const os = require("os");
const { execSync } = require("child_process");

function installPlatformDeps() {
	const platform = os.platform();
	const arch = os.arch();
	const isMusl =
		process.env.ALPINE_VERSION || process.env.DOCKER_IMAGE?.includes("alpine");

	console.log(`Platform: ${platform}, Architecture: ${arch}, Musl: ${isMusl}`);

	let rollupPkg, swcPkg;

	if (platform === "linux") {
		if (isMusl) {
			rollupPkg = "@rollup/rollup-linux-x64-musl";
			swcPkg = "@swc/core-linux-x64-musl";
		} else {
			rollupPkg = "@rollup/rollup-linux-x64-gnu";
			swcPkg = "@swc/core-linux-x64-gnu";
		}

		console.log(
			`Installing Linux dependencies: ${rollupPkg}, ${swcPkg}, @esbuild/linux-x64`
		);

		try {
			execSync(
				`npm install ${rollupPkg} ${swcPkg} @esbuild/linux-x64 --no-save`,
				{ stdio: "inherit" }
			);
			console.log("✅ Platform dependencies installed successfully");
		} catch (error) {
			console.log("⚠️ Platform dependencies install failed, continuing...");
			console.log(`Error: ${error.message}`);
		}
	} else {
		console.log(
			`Platform ${platform} detected - no platform-specific dependencies needed`
		);
	}
}

// Run the function
installPlatformDeps();
