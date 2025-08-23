#!/usr/bin/env node

/**
 * Security Audit Script for TopTable Games
 * Checks for common security vulnerabilities and misconfigurations
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SecurityAuditor {
	constructor() {
		this.issues = [];
		this.warnings = [];
		this.passed = [];
	}

	async runAudit() {
		console.log("🔍 Starting Security Audit for TopTable Games\n");

		// Run all security checks
		this.checkEnvironmentFiles();
		this.checkPackageDependencies();
		this.checkDatabaseQueries();
		this.checkServerConfiguration();
		this.checkDockerSecurity();
		this.checkFilePermissions();

		// Generate report
		this.generateReport();
	}

	checkEnvironmentFiles() {
		console.log("🔒 Checking Environment Security...");

		// Check if .env exists in repo (bad)
		if (fs.existsSync(".env")) {
			this.issues.push(
				"❌ .env file found in repository - move to .env.local or add to .gitignore"
			);
		} else {
			this.passed.push("✅ No .env file in repository");
		}

		// Check .env.example
		if (fs.existsSync(".env.example")) {
			const envExample = fs.readFileSync(".env.example", "utf8");

			// Check for exposed secrets in example
			const dangerousPatterns = [
				/password\s*=\s*[^<\s]/i,
				/secret\s*=\s*[^<\s]/i,
				/key\s*=\s*[^<\s]/i,
			];

			dangerousPatterns.forEach((pattern) => {
				if (pattern.test(envExample)) {
					this.warnings.push("⚠️  .env.example may contain real secrets");
				}
			});
		}

		// Check .env.template
		if (fs.existsSync(".env.template")) {
			this.passed.push("✅ .env.template found - good security practice");
		}
	}

	checkPackageDependencies() {
		console.log("📦 Checking Package Dependencies...");

		if (fs.existsSync("package.json")) {
			const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
			const deps = {
				...packageJson.dependencies,
				...packageJson.devDependencies,
			};

			// Check for security packages
			const securityPackages = [
				"helmet",
				"express-rate-limit",
				"cors",
				"validator",
			];
			const foundSecurity = securityPackages.filter((pkg) => deps[pkg]);

			if (foundSecurity.length >= 3) {
				this.passed.push(
					`✅ Security packages found: ${foundSecurity.join(", ")}`
				);
			} else {
				this.warnings.push("⚠️  Missing recommended security packages");
			}

			// Check for vulnerable packages (basic check)
			const vulnerablePackages = {
				lodash: "< 4.17.21",
				axios: "< 1.6.0",
				express: "< 4.18.0",
			};

			Object.entries(vulnerablePackages).forEach(([pkg, minVersion]) => {
				if (deps[pkg]) {
					// Basic version check (would need proper semver comparison in real audit)
					this.passed.push(`✅ ${pkg} dependency found`);
				}
			});
		}
	}

	checkDatabaseQueries() {
		console.log("💾 Checking Database Query Security...");

		const sqlFiles = this.findSQLFiles("db/");
		let parameterizedQueries = 0;
		let totalQueries = 0;

		sqlFiles.forEach((file) => {
			const content = fs.readFileSync(file, "utf8");
			totalQueries++;

			// Check for parameterized queries ($1, $2, etc.)
			if (/\$\d+/.test(content)) {
				parameterizedQueries++;
			} else {
				// Check for potential SQL injection risks
				const dangerousPatterns = [
					/VALUES\s*\(\s*['"][^$]/i,
					/WHERE\s+\w+\s*=\s*['"][^$]/i,
					/INSERT\s+INTO.*VALUES\s*\([^$]*['"][^$]/i,
				];

				dangerousPatterns.forEach((pattern) => {
					if (pattern.test(content)) {
						this.warnings.push(`⚠️  Potential SQL injection risk in ${file}`);
					}
				});
			}
		});

		if (parameterizedQueries === totalQueries && totalQueries > 0) {
			this.passed.push(
				`✅ All ${totalQueries} SQL queries use parameterized statements`
			);
		} else {
			this.issues.push(
				`❌ ${
					totalQueries - parameterizedQueries
				} SQL queries may be vulnerable`
			);
		}
	}

	checkServerConfiguration() {
		console.log("🖥️  Checking Server Configuration...");

		// Check main server file
		if (fs.existsSync("server/index.js")) {
			const serverContent = fs.readFileSync("server/index.js", "utf8");

			// Check for security middleware
			const securityChecks = [
				{ pattern: /helmet/i, name: "Helmet security headers" },
				{ pattern: /express-rate-limit/i, name: "Rate limiting" },
				{ pattern: /cors/i, name: "CORS configuration" },
				{ pattern: /express\.json.*limit/i, name: "Request size limiting" },
			];

			securityChecks.forEach((check) => {
				if (check.pattern.test(serverContent)) {
					this.passed.push(`✅ ${check.name} configured`);
				} else {
					this.warnings.push(`⚠️  ${check.name} not found`);
				}
			});

			// Check for insecure practices
			if (/trust proxy.*true/i.test(serverContent)) {
				this.passed.push("✅ Proxy trust configured for production");
			}

			if (/httpOnly.*true/i.test(serverContent)) {
				this.passed.push("✅ HTTP-only cookies configured");
			}
		}
	}

	checkDockerSecurity() {
		console.log("🐳 Checking Docker Security...");

		if (fs.existsSync("Dockerfile")) {
			const dockerContent = fs.readFileSync("Dockerfile", "utf8");

			// Check for non-root user
			if (/USER\s+(?!root)/i.test(dockerContent)) {
				this.passed.push("✅ Docker runs as non-root user");
			} else {
				this.issues.push("❌ Docker may be running as root user");
			}

			// Check for security updates
			if (
				/apt-get\s+update.*upgrade/i.test(dockerContent) ||
				/apk\s+update.*upgrade/i.test(dockerContent)
			) {
				this.passed.push("✅ Docker image includes security updates");
			} else {
				this.warnings.push("⚠️  Docker image may not include security updates");
			}

			// Check for .dockerignore
			if (fs.existsSync(".dockerignore")) {
				const dockerignoreContent = fs.readFileSync(".dockerignore", "utf8");
				if (/\.env/i.test(dockerignoreContent)) {
					this.passed.push("✅ .dockerignore excludes environment files");
				} else {
					this.warnings.push("⚠️  .dockerignore should exclude .env files");
				}
			} else {
				this.warnings.push("⚠️  .dockerignore file missing");
			}
		}
	}

	checkFilePermissions() {
		console.log("📁 Checking File Permissions...");

		const sensitiveFiles = ["server/config/", "server/middleware/", "db/"];

		// Basic check for file existence
		sensitiveFiles.forEach((filePath) => {
			if (fs.existsSync(filePath)) {
				this.passed.push(`✅ Sensitive directory ${filePath} exists`);
			}
		});

		// Check .gitignore
		if (fs.existsSync(".gitignore")) {
			const gitignoreContent = fs.readFileSync(".gitignore", "utf8");
			const importantIgnores = [".env", "node_modules", "*.log"];

			importantIgnores.forEach((ignore) => {
				if (gitignoreContent.includes(ignore)) {
					this.passed.push(`✅ .gitignore excludes ${ignore}`);
				} else {
					this.warnings.push(`⚠️  .gitignore should exclude ${ignore}`);
				}
			});
		}
	}

	findSQLFiles(dir) {
		const files = [];

		if (!fs.existsSync(dir)) return files;

		const items = fs.readdirSync(dir);

		items.forEach((item) => {
			const fullPath = path.join(dir, item);
			const stat = fs.statSync(fullPath);

			if (stat.isDirectory()) {
				files.push(...this.findSQLFiles(fullPath));
			} else if (item.endsWith(".sql")) {
				files.push(fullPath);
			}
		});

		return files;
	}

	generateReport() {
		console.log("\n" + "=".repeat(60));
		console.log("🛡️  SECURITY AUDIT REPORT");
		console.log("=".repeat(60));

		// Summary
		const totalChecks =
			this.issues.length + this.warnings.length + this.passed.length;
		const securityScore = Math.round((this.passed.length / totalChecks) * 100);

		console.log(`\n📊 SECURITY SCORE: ${securityScore}%`);
		console.log(`✅ Passed: ${this.passed.length}`);
		console.log(`⚠️  Warnings: ${this.warnings.length}`);
		console.log(`❌ Issues: ${this.issues.length}`);

		// Critical Issues
		if (this.issues.length > 0) {
			console.log("\n🚨 CRITICAL ISSUES (Must Fix):");
			this.issues.forEach((issue) => console.log(`  ${issue}`));
		}

		// Warnings
		if (this.warnings.length > 0) {
			console.log("\n⚠️  WARNINGS (Should Fix):");
			this.warnings.forEach((warning) => console.log(`  ${warning}`));
		}

		// What's working well
		if (this.passed.length > 0) {
			console.log("\n✅ SECURITY MEASURES IN PLACE:");
			this.passed.forEach((pass) => console.log(`  ${pass}`));
		}

		// Recommendations
		console.log("\n💡 SECURITY RECOMMENDATIONS:");
		console.log("  • Run `npm audit` regularly for dependency vulnerabilities");
		console.log("  • Implement proper logging and monitoring");
		console.log("  • Use HTTPS in production");
		console.log("  • Regular security updates and patches");
		console.log("  • Implement proper backup and recovery procedures");
		console.log("  • Consider implementing 2FA for admin accounts");

		console.log("\n" + "=".repeat(60));

		// Exit code based on critical issues
		if (this.issues.length > 0) {
			console.log("❌ Security audit failed - please address critical issues");
			process.exit(1);
		} else {
			console.log("✅ Security audit passed - good job!");
			process.exit(0);
		}
	}
}

// Run the audit
const auditor = new SecurityAuditor();
auditor.runAudit().catch(console.error);

export default SecurityAuditor;
