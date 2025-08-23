require("dotenv").config();
const express = require("express");
const session = require("express-session");
const massive = require("massive");
const path = require("path");
const authMiddleware = require("./middleware/authMiddleware");
const auth = require("./controllers/authController");
const game = require("./controllers/gameController");
const player = require("./controllers/playerController");
const userGames = require("./controllers/userGamesController");
const userInfo = require("./controllers/userInfoController");
const passwordReset = require("./controllers/passwordReset");

const app = express();

const {
	CONNECTION_STRING,
	SERVER_PORT = 4050,
	SESSION_SECRET,
	NODE_ENV,
} = process.env;

// Trust proxy for production deployments
if (NODE_ENV === "production") {
	app.set("trust proxy", 1);
}

app.use(express.json());

// Serve static files from Vite build
if (NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "../dist")));
} else {
	// In development, this will be handled by Vite dev server
	app.use(express.static(path.join(__dirname, "../public")));
}

app.use(
	session({
		secret: SESSION_SECRET || "fallback-secret-change-me",
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24, // 24 hours
			secure: NODE_ENV === "production", // HTTPS only in production
			httpOnly: true,
			sameSite: "lax",
		},
	})
);

// Health check endpoint for Docker
app.get("/api/health", (req, res) => {
	res.status(200).json({
		status: "OK",
		timestamp: new Date().toISOString(),
		environment: NODE_ENV,
	});
});

//Auth endpoints
app.post("/api/auth/register", auth.register);
app.post("/api/auth/login", auth.login);
app.get("/api/auth/user", authMiddleware.authorize, auth.getUser);
app.delete("/api/auth/logout", auth.logout);

// Game endpoints
app.get("/api/game/ratings", game.gameAverageRatings);
app.get("/api/game/reviews/:id", game.gameReviews);
app.get("/api/game/players/:id", game.gamePlayers);
app.get("/api/game/plays/:id", game.totalPlays);

//UserGame endpopints
// Add User Game will appear on the search page
app.post("/api/usergame/:id", authMiddleware.authorize, userGames.addUserGame);
app.get("/api/usergame", authMiddleware.authorize, userGames.getUserGames);
// app.get('/api/usergame/:id', authMiddleware.authorize, userGames.getUserGame);
// Item display
app.put(
	"/api/usergame/review",
	authMiddleware.authorize,
	userGames.updateReview
);
app.put(
	"/api/usergame/rating",
	authMiddleware.authorize,
	userGames.updateRating
);
app.put(
	"/api/usergame/inccount/:id",
	authMiddleware.authorize,
	userGames.incPlayCount
);
app.put(
	"/api/usergame/deccount/:id",
	authMiddleware.authorize,
	userGames.decPlayCount
);
app.delete("/api/usergame/:id", authMiddleware.authorize, userGames.deleteGame);

// //UserInfo endpoints -> My Account
app.put("/api/user/:editType", authMiddleware.authorize, userInfo.editInfo);
app.delete("/api/user/delete", authMiddleware.authorize, userInfo.deleteUser);

// Password Reset Endpoints
app.put("/api/pwdReset/req", passwordReset.resetPwdEmail);
app.put("/api/pwdReset/submit/:token", passwordReset.processReset);
// //Player endpoints
// Item Display //User Graph
app.get("/api/player/playcount/:id", player.getPlayerTotalPlays);
// Leaderboard
app.get("/api/player/leaderboard", player.getAllPlayersTotalPlays);

// Catch-all handler for SPA - must be last route
if (NODE_ENV === "production") {
	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, "../dist/index.html"));
	});
}

massive({
	connectionString: CONNECTION_STRING,
	// @ts-ignore
	ssl: { rejectUnauthorized: false },
})
	.then((dbInstance) => {
		app.set("db", dbInstance);
		console.log(`🚀 Database connected`);
		app.listen(SERVER_PORT, () => {
			console.log(`🚀 Server running on port ${SERVER_PORT}`);
			console.log(`🌍 Environment: ${NODE_ENV}`);
			console.log(
				`🏥 Health check: http://localhost:${SERVER_PORT}/api/health`
			);
		});
	})
	.catch((err) => {
		console.error("💥 Database connection failed:", err);
		process.exit(1);
	});
