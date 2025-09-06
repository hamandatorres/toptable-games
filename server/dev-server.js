const express = require("express");
const massive = require("massive");
const cors = require("cors");
const session = require("express-session");
const helmet = require("helmet");
const crypto = require("crypto");
require("dotenv").config();
const { validatePassword } = require("./utils/passwordValidation");
const {
	enhancedAuthRateLimit,
	accountLockoutMiddleware,
	detectSuspiciousActivity,
	passwordResetRateLimit,
	createApiRateLimit,
} = require("./middleware/enhancedRateLimiting");
const auth = require("./controllers/authController");

const app = express();
const PORT = process.env.PORT || 4050;

// Security middleware
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				scriptSrc: ["'self'"],
				imgSrc: ["'self'", "data:", "https:"],
			},
		},
		crossOriginEmbedderPolicy: false, // Allow embedding for development
	})
);

// CORS middleware for development
app.use(
	cors({
		origin: [
			process.env.FRONTEND_URL || "http://localhost:3000",
			"http://localhost:3001",
		],
		credentials: true,
	})
);

app.use(express.json({ limit: "10mb" }));

// Apply general rate limiting and suspicious activity detection
app.use(createApiRateLimit(100)); // 100 requests per 15 minutes
app.use(detectSuspiciousActivity);

// Generate a secure session secret if not provided
const sessionSecret =
	process.env.SESSION_SECRET || crypto.randomBytes(64).toString("hex");

// Enhanced session configuration
app.use(
	session({
		secret: sessionSecret,
		resave: false,
		saveUninitialized: false,
		name: "sessionId", // Don't use default connect.sid name
		cookie: {
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
			secure: process.env.NODE_ENV === "production", // HTTPS only in production
			httpOnly: true, // Prevent XSS attacks
			sameSite: "strict", // CSRF protection
		},
		// Regenerate session on each request in development for extra security
		rolling: process.env.NODE_ENV === "development",
	})
);

// Database connection with environment variables
let db;
massive({
	connectionString:
		process.env.DB_CONNECTION_STRING ||
		"postgresql://postgres:postgres@localhost:5432/toptable_games",
	ssl:
		process.env.NODE_ENV === "production"
			? { rejectUnauthorized: false }
			: false,
})
	.then((dbInstance) => {
		db = dbInstance;
		app.set("db", dbInstance); // Make db available to middleware
		console.log("✅ Connected to PostgreSQL database");
	})
	.catch((err) => {
		console.error("❌ Database connection failed:", err.message);
	});

// Health check endpoint
app.get("/api/health", (req, res) => {
	res.json({ status: "OK", database: db ? "connected" : "disconnected" });
});

// Auth endpoints
app.get("/api/auth/user", async (req, res) => {
	try {
		if (!db) return res.status(500).json({ error: "Database not connected" });

		console.log("🔍 Auth user request - session user:", req.session.user);

		// For development, return a mock user or check session
		if (req.session.user) {
			const user = await db.user.getUserById([req.session.user.user_id]);
			console.log("✅ Found user by ID:", user[0]?.username || "not found");
			res.json(user[0] || null);
		} else {
			console.log("❌ No session user found");
			res.json(null);
		}
	} catch (err) {
		console.error("❌ Auth error:", err);
		res.status(500).json({ error: "Server error" });
	}
});

// Game ratings endpoint
app.get("/api/game/ratings", async (req, res) => {
	try {
		console.log("📊 Game ratings endpoint called");
		if (!db) {
			console.log("❌ Database not connected");
			return res.status(500).json({ error: "Database not connected" });
		}

		console.log("🔍 Checking db.game functions:", Object.keys(db.game || {}));
		console.log("📈 Calling allGameAverageRatings...");

		const ratings = await db.game.allGameAverageRatings();
		console.log("✅ Ratings retrieved:", ratings?.length || 0, "records");
		res.json(ratings);
	} catch (err) {
		console.error("❌ Game ratings error:", err.message);
		console.error("Stack:", err.stack);
		res.status(500).json({ error: "Server error", details: err.message });
	}
});

// Player leaderboard endpoint
app.get("/api/player/leaderboard", async (req, res) => {
	try {
		if (!db) return res.status(500).json({ error: "Database not connected" });

		const leaderboard = await db.player.getAllPlayersTotalPlays();
		res.json(leaderboard);
	} catch (err) {
		console.error("Leaderboard error:", err);
		res.status(500).json({ error: "Server error" });
	}
});

// User games endpoints (both usergame and usergames for compatibility)
app.get("/api/usergame", async (req, res) => {
	try {
		if (!db) return res.status(500).json({ error: "Database not connected" });

		if (!req.session.user) {
			return res.json([]);
		}

		const userGames = await db.userGames.getUserGames([
			req.session.user.user_id,
		]);
		res.json(userGames);
	} catch (err) {
		console.error("User games error:", err);
		res.status(500).json({ error: "Server error" });
	}
});

app.get("/api/usergames", async (req, res) => {
	try {
		if (!db) return res.status(500).json({ error: "Database not connected" });

		if (!req.session.user) {
			return res.json([]);
		}

		const userGames = await db.userGames.getUserGames([
			req.session.user.user_id,
		]);
		res.json(userGames);
	} catch (err) {
		console.error("User games error:", err);
		res.status(500).json({ error: "Server error" });
	}
});

// Registration endpoint - using production authController with enhanced validation
app.post("/api/auth/register", enhancedAuthRateLimit, auth.register);

// Login endpoint - using production authController with enhanced validation and account lockout
app.post(
	"/api/auth/login",
	accountLockoutMiddleware,
	enhancedAuthRateLimit,
	auth.login
);

// Logout endpoint - using production authController
app.post("/api/auth/logout", auth.logout);
app.delete("/api/auth/logout", auth.logout);
app.get("/api/auth/logout", auth.logout); // Support legacy GET requests
// Get user endpoint
app.get("/api/auth/user", auth.getUser);

// Health check endpoint
app.get("/api/health", (req, res) => {
	res.json({ status: "OK", database: db ? "connected" : "disconnected" });
});

// Global error handlers
process.on("uncaughtException", (err) => {
	console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

app.listen(PORT, () => {
	console.log(`🚀 Development server running on http://localhost:${PORT}`);
	console.log(
		`🗄️  Database: postgresql://postgres:postgres@localhost:5432/toptable_games`
	);
	console.log(`🌐 Frontend: http://localhost:3000`);
	console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
