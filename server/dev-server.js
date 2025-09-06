const express = require("express");
const massive = require("massive");
const cors = require("cors");
const session = require("express-session");
const { validatePassword } = require("./utils/passwordValidation");

const app = express();
const PORT = 4050;

// Simple middleware for development
app.use(
	cors({
		origin: ["http://localhost:3000", "http://localhost:3001"],
		credentials: true,
	})
);

app.use(express.json());

app.use(
	session({
		secret: "development-secret-key",
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 86400000, // 24 hours
			secure: false, // Set to true in production with HTTPS
			httpOnly: true,
		},
	})
);

// Database connection
let db;
massive({
	connectionString:
		"postgresql://postgres:postgres@localhost:5432/toptable_games",
	ssl: false,
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

// Registration endpoint
app.post("/api/auth/register", async (req, res) => {
	try {
		if (!db) return res.status(500).json({ error: "Database not connected" });

		const { firstName, lastName, username, email, password } = req.body;

		// Validate required fields
		if (!firstName || !lastName || !username || !email || !password) {
			return res.status(400).json({
				error: "incomplete",
				message: "All fields are required",
			});
		}

		// For development, we'll use our comprehensive password validation
		// Note: In production, this should use the authController instead
		console.log("⚠️  DEV MODE: Using comprehensive password validation");

		const passwordValidation = validatePassword(password);
		if (!passwordValidation.isValid) {
			return res.status(400).json({
				error: "invalid_password",
				message: passwordValidation.message,
			});
		}

		// Simple development registration
		const existingUser = await db.user.getUserByUsername([username]);
		if (existingUser.length > 0) {
			return res.status(400).json({ error: "Username already exists" });
		}

		// Insert new user (simplified for development)
		// SQL expects: (email, username, first_name, last_name, hash)
		const newUser = await db.user.register([
			email,
			username,
			firstName,
			lastName,
			"dev-hash",
		]);
		if (newUser.length > 0) {
			req.session.user = newUser[0];

			// Explicitly save the session
			req.session.save((err) => {
				if (err) {
					console.error("❌ Registration session save error:", err);
					return res.status(500).json({ error: "Session save failed" });
				}
				console.log(
					"✅ Registration successful for user:",
					newUser[0].username
				);
				console.log("✅ Session saved with user_id:", newUser[0].user_id);
				res.json(newUser[0]); // Return user object directly to match frontend expectations
			});
		} else {
			res.status(400).json({ error: "Registration failed" });
		}
	} catch (err) {
		console.error("Registration error:", err);
		res.status(500).json({ error: "Server error" });
	}
});

// Simple login for development
app.post("/api/auth/login", async (req, res) => {
	try {
		if (!db) return res.status(500).json({ error: "Database not connected" });

		console.log("🔍 Login request received:");
		console.log("  Headers:", req.headers);
		console.log("  Body:", req.body);
		console.log("  Raw body type:", typeof req.body);

		const { username, userCreds, password } = req.body;

		// Development login - support both simple username and frontend userCreds format
		const loginIdentifier = username || userCreds;

		if (!loginIdentifier) {
			console.log("❌ No login identifier provided");
			return res.status(400).json({ error: "Username or userCreds required" });
		}

		console.log("🔍 Login identifier:", loginIdentifier);

		// Simple development login - just find user by username (no password validation)
		const user = await db.user.getUserByUsername([loginIdentifier]);
		if (user.length > 0) {
			req.session.user = user[0];

			// Explicitly save the session
			req.session.save((err) => {
				if (err) {
					console.error("❌ Session save error:", err);
					return res.status(500).json({ error: "Session save failed" });
				}
				console.log("✅ Login successful for user:", user[0].username);
				console.log("✅ Session saved with user_id:", user[0].user_id);
				res.json(user[0]); // Return user object directly to match frontend expectations
			});
		} else {
			console.log("❌ User not found:", loginIdentifier);
			res.status(401).json({ error: "User not found" });
		}
	} catch (err) {
		console.error("❌ Login error:", err);
		res.status(500).json({ error: "Server error" });
	}
});

// Logout (support GET, POST, and DELETE)
app.post("/api/auth/logout", (req, res) => {
	console.log("🚪 Logout request received (POST)");
	req.session.destroy((err) => {
		if (err) {
			console.error("❌ Session destroy error:", err);
			return res.status(500).json({ error: "Logout failed" });
		}
		console.log("✅ User logged out successfully");
		res.json({ success: true });
	});
});

app.get("/api/auth/logout", (req, res) => {
	console.log("🚪 Logout request received (GET)");
	req.session.destroy((err) => {
		if (err) {
			console.error("❌ Session destroy error:", err);
			return res.status(500).json({ error: "Logout failed" });
		}
		console.log("✅ User logged out successfully");
		res.json({ success: true });
	});
});

app.delete("/api/auth/logout", (req, res) => {
	console.log("🚪 Logout request received (DELETE)");
	req.session.destroy((err) => {
		if (err) {
			console.error("❌ Session destroy error:", err);
			return res.status(500).json({ error: "Logout failed" });
		}
		console.log("✅ User logged out successfully");
		res.json({ success: true });
	});
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
