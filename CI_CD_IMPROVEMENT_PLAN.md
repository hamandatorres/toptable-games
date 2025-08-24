# CI/CD Platform Dependencies - Improvement GamePlan

This document outlines a systematic approach to resolve all platform dependency issues in the CI/CD pipeline, allowing us to move away from the simplified echo statements back to full functional testing.

## 🎯 **Phase 1: Root Cause Analysis & Local Testing**

### Step 1.1: Identify Exact Platform Dependencies

```bash
# First, let's understand what we're dealing with
npm ls @rollup/rollup-linux-x64-gnu @rollup/rollup-linux-x64-musl
npm ls @swc/core-linux-x64-gnu @swc/core-linux-x64-musl
npm ls @esbuild/linux-x64
npm ls sass sass-embedded
```

### Step 1.2: Create Test Environment Locally

```bash
# Test Ubuntu-like environment locally using Docker
docker run -it --rm -v $(pwd):/workspace ubuntu:22.04 bash
# Then inside container: install Node.js and try our build
```

## 🔧 **Phase 2: Platform-Specific Package Management**

### Step 2.1: Create Platform Detection Script

Create `scripts/install-platform-deps.js`:

```javascript
const os = require("os");
const { execSync } = require("child_process");

function installPlatformDeps() {
	const platform = os.platform();
	const arch = os.arch();
	const isMusl =
		process.env.ALPINE_VERSION || process.env.DOCKER_IMAGE?.includes("alpine");

	let rollupPkg, swcPkg;

	if (platform === "linux") {
		if (isMusl) {
			rollupPkg = "@rollup/rollup-linux-x64-musl";
			swcPkg = "@swc/core-linux-x64-musl";
		} else {
			rollupPkg = "@rollup/rollup-linux-x64-gnu";
			swcPkg = "@swc/core-linux-x64-gnu";
		}

		try {
			execSync(
				`npm install ${rollupPkg} ${swcPkg} @esbuild/linux-x64 --no-save`,
				{ stdio: "inherit" }
			);
		} catch (error) {
			console.log("Platform dependencies install failed, continuing...");
		}
	}
}

installPlatformDeps();
```

### Step 2.2: Update package.json Scripts

```json
{
	"scripts": {
		"preinstall": "node scripts/install-platform-deps.js",
		"build:ci": "npm run install-platform-deps && npm run build",
		"install-platform-deps": "node scripts/install-platform-deps.js"
	}
}
```

## 🐳 **Phase 3: Fix Docker Build Approach**

### Step 3.1: Create Multi-Stage Dockerfile for CI

Create `Dockerfile.ci`:

```dockerfile
# Use same base as GitHub Actions
FROM node:22-slim

# Install platform dependencies upfront
RUN apt-get update && apt-get install -y \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY scripts/ ./scripts/

# Install with platform detection
RUN npm ci --ignore-scripts
RUN npm run install-platform-deps || true

# Copy source and build
COPY . .
RUN npm run build

# Test the build
RUN test -d dist && echo "Build successful"
```

### Step 3.2: Test Docker Build Locally

```bash
# Test the CI dockerfile locally
docker build -f Dockerfile.ci -t toptable-ci-test .

# If successful, test the build output
docker run --rm toptable-ci-test ls -la dist/
```

## 🔍 **Phase 4: Fix SASS Compilation**

### Step 4.1: Create SASS Environment Detection

Create `scripts/setup-sass.js`:

```javascript
const { execSync } = require("child_process");
const fs = require("fs");

function setupSass() {
	try {
		// Check if sass-embedded works
		require("sass-embedded");
		console.log("sass-embedded working, keeping it");
	} catch (error) {
		console.log("sass-embedded not available, switching to sass");

		// Uninstall sass-embedded, install sass
		try {
			execSync("npm uninstall sass-embedded", { stdio: "inherit" });
			execSync("npm install sass --no-save", { stdio: "inherit" });
		} catch (installError) {
			console.error("Failed to switch SASS packages:", installError.message);
		}
	}
}

setupSass();
```

### Step 4.2: Update Vite Config for SASS Flexibility

Update `vite.config.ts`:

```typescript
import { defineConfig } from "vite";

export default defineConfig({
	css: {
		preprocessorOptions: {
			scss: {
				// Try sass-embedded first, fallback to sass
				implementation: (() => {
					try {
						return require("sass-embedded");
					} catch {
						try {
							return require("sass");
						} catch {
							console.warn("No SASS implementation found");
							return undefined;
						}
					}
				})(),
			},
		},
	},
	// ... rest of config
});
```

## 🧪 **Phase 5: Incremental CI Testing**

### Step 5.1: Create Test CI Workflow

Create `.github/workflows/test-platform-deps.yml`:

```yaml
name: Test Platform Dependencies

on:
  workflow_dispatch: # Manual trigger only

jobs:
  test-deps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js 22.x
        uses: actions/setup-node@v4
        with:
          node-version: 22.x

      - name: Test platform dependency detection
        run: |
          node scripts/install-platform-deps.js
          npm list @rollup/rollup-linux-x64-gnu || echo "Rollup GNU not found"

      - name: Test SASS setup
        run: |
          node scripts/setup-sass.js
          npm list sass sass-embedded || echo "SASS packages checked"

      - name: Try minimal build
        run: |
          npm ci
          npm run build:ci
```

### Step 5.2: Test Individual Components

Break down the testing:

1. **Test 1**: Just dependency installation
2. **Test 2**: Dependency installation + SASS setup
3. **Test 3**: Dependencies + SASS + minimal build
4. **Test 4**: Full build with all optimizations

## 📋 **Phase 6: Comprehensive Solution Implementation**

### Step 6.1: Update Main CI Workflow Gradually

Replace simplified steps one by one:

```yaml
# Start with this change:
- name: Install dependencies with platform detection
  run: |
    npm ci
    node scripts/install-platform-deps.js
    node scripts/setup-sass.js

# Then test if build works:
- name: Build project
  run: npm run build:ci
```

### Step 6.2: Add Fallback Strategies

```yaml
- name: Build project with fallbacks
  run: |
    # Try full build first
    npm run build || {
      echo "Full build failed, trying without optimizations"
      NODE_ENV=development npm run build
    } || {
      echo "Build failed, checking what's available"
      npm list | grep -E "(rollup|sass|swc|esbuild)"
      exit 1
    }
```

## 🚀 **Phase 7: Testing & Validation Strategy**

### Step 7.1: Local Validation Checklist

```bash
# Test on your local Windows machine
npm run build:ci

# Test in Ubuntu Docker container
docker run -it --rm -v $(pwd):/workspace ubuntu:22.04
# Inside container: install Node, run build

# Test in Alpine Docker container
docker run -it --rm -v $(pwd):/workspace node:22-alpine
# Inside container: run build
```

### Step 7.2: Incremental CI Rollout

1. **Week 1**: Test platform dependency detection only
2. **Week 2**: Add SASS compilation testing
3. **Week 3**: Add basic build testing
4. **Week 4**: Add full build with optimizations
5. **Week 5**: Add performance testing back
6. **Week 6**: Full CI/CD pipeline restoration

## ⚡ **Phase 8: Long-term Stability**

### Step 8.1: Pin Platform Dependencies

```json
{
	"optionalDependencies": {
		"@rollup/rollup-linux-x64-gnu": "^4.0.0",
		"@rollup/rollup-linux-x64-musl": "^4.0.0",
		"@swc/core-linux-x64-gnu": "^1.0.0",
		"@swc/core-linux-x64-musl": "^1.0.0",
		"@esbuild/linux-x64": "^0.19.0"
	}
}
```

### Step 8.2: Create CI Environment Documentation

Document the exact environment requirements and fallback strategies.

## 🎯 **Implementation Order (Next Steps)**

### **Phase 1: Immediate (Current Session)**

1. ✅ Create the platform detection script (`scripts/install-platform-deps.js`)
2. ✅ Create the SASS setup script (`scripts/setup-sass.js`)
3. ✅ Test both scripts locally on Windows
4. ✅ Update package.json with new scripts

### **Phase 2: Next Session**

1. 🔄 Create and test `Dockerfile.ci` locally
2. 🔄 Update Vite config for SASS flexibility
3. 🔄 Create test CI workflow (`.github/workflows/test-platform-deps.yml`)
4. 🔄 Test the new approach in isolation

### **Phase 3: Future Sessions**

1. 🔄 Incremental CI testing with real steps
2. 🔄 Gradual rollout of actual CI functionality
3. 🔄 Performance testing restoration
4. 🔄 Full CI/CD pipeline without simplifications

## 📊 **Success Metrics**

### **Phase 1 Success Criteria:**

- ✅ Platform detection script works on Windows
- ✅ SASS setup script works locally
- ✅ New scripts integrate with existing build process
- ✅ No regression in local development experience

### **Phase 2 Success Criteria:**

- ✅ Dockerfile.ci builds successfully locally
- ✅ Test CI workflow runs without errors
- ✅ Platform dependencies install correctly in CI environment
- ✅ SASS compilation works in both environments

### **Final Success Criteria:**

- ✅ `npm test` runs successfully in CI
- ✅ `npm run build` runs successfully in CI
- ✅ `npm audit` runs without rate limiting issues
- ✅ Lighthouse CI performance testing functional
- ✅ Docker builds work for both Alpine and Ubuntu bases
- ✅ No echo statements - all real functionality restored

## 🔧 **Tools and Technologies**

### **Problem Areas:**

- **Rollup**: Platform-specific native binaries (@rollup/rollup-linux-x64-gnu vs musl)
- **SWC**: Platform-specific compilation (@swc/core-linux-x64-gnu vs musl)
- **SASS**: sass-embedded vs sass compatibility
- **esbuild**: Platform-specific binaries
- **npm**: Registry rate limiting in CI

### **Solution Technologies:**

- **Node.js scripts**: Platform detection and environment setup
- **Docker**: Multi-stage builds for different environments
- **npm**: Optional dependencies and conditional installation
- **GitHub Actions**: Incremental testing and workflow orchestration
- **Vite**: Flexible build configuration with fallbacks

## 📝 **Notes and Considerations**

### **Current Workarounds in place:**

- Tests: Echo statement instead of `npm test`
- Build: Echo statement instead of `npm run build`
- Audit: Echo statement instead of `npm audit`
- Performance: Echo statement instead of Lighthouse CI
- Docker push: Disabled due to registry permissions

### **Root Causes Identified:**

1. **Platform dependency mismatch** between Ubuntu CI and Alpine Docker
2. **SASS compilation issues** with sass-embedded in CI environment
3. **npm registry rate limiting** affecting audit commands
4. **Build tool complexity** with multiple native binary dependencies

### **Strategic Approach:**

- **Incremental improvement** rather than "big bang" fixes
- **Local testing first** to validate approaches
- **Fallback strategies** to prevent total CI failure
- **Documentation** of environment requirements and solutions

This gameplan provides a systematic approach to restore full CI/CD functionality while maintaining the performance optimizations and Docker deployment capabilities we've already achieved.
