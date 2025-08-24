const { execSync } = require("child_process");

function testCIEnvironment() {
	console.log("🧪 Testing CI Environment Simulation");
	console.log("=====================================");

	// Test 1: Platform detection script
	console.log("\n1️⃣ Testing platform detection script...");
	try {
		execSync("node scripts/install-platform-deps.js", { stdio: "inherit" });
		console.log("✅ Platform detection script passed");
	} catch (error) {
		console.log("❌ Platform detection script failed:", error.message);
	}

	// Test 2: SASS setup script
	console.log("\n2️⃣ Testing SASS setup script...");
	try {
		execSync("node scripts/setup-sass.js", { stdio: "inherit" });
		console.log("✅ SASS setup script passed");
	} catch (error) {
		console.log("❌ SASS setup script failed:", error.message);
	}

	// Test 3: Build CI script
	console.log("\n3️⃣ Testing build:ci script...");
	try {
		execSync("npm run build:ci", { stdio: "inherit" });
		console.log("✅ Build CI script passed");
	} catch (error) {
		console.log("❌ Build CI script failed:", error.message);
	}

	// Test 4: Check if dist directory exists
	console.log("\n4️⃣ Verifying build output...");
	try {
		const fs = require("fs");
		if (fs.existsSync("dist")) {
			const files = fs.readdirSync("dist");
			console.log(`✅ Build output verified - ${files.length} files in dist/`);
		} else {
			console.log("❌ Build output not found");
		}
	} catch (error) {
		console.log("❌ Build output verification failed:", error.message);
	}

	console.log("\n🎉 CI Environment Test Complete!");
}

// Run the test
testCIEnvironment();
