const express = require("express");
const massive = require("massive");
const cors = require("cors");
const session = require("express-session");

const app = express();
const PORT = 4050;

// Simple middleware for development
app.use(
	cors({
		origin: "http://localhost:3000",
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

		// For development, return a mock user or check session
		if (req.session.user) {
			const user = await db.user.getUser([req.session.user.user_id]);
			res.json(user[0] || null);
		} else {
			res.json(null);
		}
	} catch (err) {
		console.error("Auth error:", err);
		res.status(500).json({ error: "Server error" });
	}
});

// Game ratings endpoint
app.get("/api/game/ratings", async (req, res) => {
	try {
		if (!db) return res.status(500).json({ error: "Database not connected" });

		const ratings = await db.game.allGameAverageRatings();
		res.json(ratings);
	} catch (err) {
		console.error("Game ratings error:", err);
		res.status(500).json({ error: "Server error" });
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

// User games endpoints
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

// Simple login for development
app.post("/api/auth/login", async (req, res) => {
	try {
		if (!db) return res.status(500).json({ error: "Database not connected" });

		const { username } = req.body;

		// Simple development login - just find user by username
		const user = await db.user.getUserByUsername([username]);
		if (user.length > 0) {
			req.session.user = user[0];
			res.json({ success: true, user: user[0] });
		} else {
			res.status(401).json({ error: "User not found" });
		}
	} catch (err) {
		console.error("Login error:", err);
		res.status(500).json({ error: "Server error" });
	}
});

// Logout
app.post("/api/auth/logout", (req, res) => {
	req.session.destroy();
	res.json({ success: true });
});

app.listen(PORT, () => {
	console.log(`🚀 Development server running on http://localhost:${PORT}`);
	console.log(
		`🗄️  Database: postgresql://postgres:postgres@localhost:5432/toptable_games`
	);
	console.log(`🌐 Frontend: http://localhost:3000`);
	console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
