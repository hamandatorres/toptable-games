const { execSync } = require("child_process");
const fs = require("fs");

function setupSass() {
	console.log("🔍 Checking SASS environment...");

	try {
		// Check if sass-embedded works
		require("sass-embedded");
		console.log("✅ sass-embedded working, keeping it");
		return;
	} catch (error) {
		console.log("⚠️ sass-embedded not available, switching to sass");
		console.log(`Error: ${error.message}`);
	}

	// Uninstall sass-embedded, install sass
	try {
		console.log("🔄 Uninstalling sass-embedded...");
		execSync("npm uninstall sass-embedded", { stdio: "inherit" });

		console.log("📦 Installing sass...");
		execSync("npm install sass --no-save", { stdio: "inherit" });

		console.log("✅ Successfully switched to sass");
	} catch (installError) {
		console.error("❌ Failed to switch SASS packages:", installError.message);
		console.log("⚠️ Continuing with current SASS setup...");
	}
}

// Run the function
setupSass();
