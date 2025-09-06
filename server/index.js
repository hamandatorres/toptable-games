const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });
const express = require("express");
const session = require("express-session");
const massive = require("massive");

// Security imports
const EnvironmentValidator = require("./config/environmentValidator");
const SecurityConfig = require("./config/securityConfig");
const SQLSecurityMiddleware = require("./middleware/sqlSecurityMiddleware");

// Controller imports
const authMiddleware = require("./middleware/authMiddleware");
const {
	enhancedAuthRateLimit,
	accountLockoutMiddleware,
	detectSuspiciousActivity,
	passwordResetRateLimit,
	createApiRateLimit,
} = require("./middleware/enhancedRateLimiting");
const auth = require("./controllers/authController");
const game = require("./controllers/gameController");
const player = require("./controllers/playerController");
const userGames = require("./controllers/userGamesController");
const userInfo = require("./controllers/userInfoController");
const passwordReset = require("./controllers/passwordReset");
const security = require("./controllers/securityController");
const app = express();

// Validate environment and get secure configuration
const envValidator = new EnvironmentValidator();
const config = envValidator.validate();

// Configure security middleware
SecurityConfig.configureSecurityMiddleware(app, config);

// Trust proxy for production deployments
if (config.nodeEnv === "production") {
	app.set("trust proxy", 1);
}

// JSON parsing with security
app.use(express.json({ limit: "10mb" }));

// Enhanced rate limiting and suspicious activity detection
app.use(createApiRateLimit(100)); // 100 requests per 15 minutes
app.use(detectSuspiciousActivity);

// Serve static files from Vite build
if (config.nodeEnv === "production") {
	app.use(express.static(path.join(__dirname, "../dist")));
} else {
	// In development, this will be handled by Vite dev server
	app.use(express.static(path.join(__dirname, "../public")));
}

// Session configuration with security
const sessionConfig = SecurityConfig.getSessionConfig(config);
app.use(session(sessionConfig));

// Health check endpoint with security
app.get("/api/health", SecurityConfig.healthCheck);

//Auth endpoints with security middleware
app.post(
	"/api/auth/register",
	enhancedAuthRateLimit,
	SQLSecurityMiddleware.auditLog("user_register"),
	auth.register
);
app.post(
	"/api/auth/login",
	accountLockoutMiddleware,
	enhancedAuthRateLimit,
	SQLSecurityMiddleware.auditLog("user_login"),
	auth.login
);
app.get("/api/auth/user", authMiddleware.authorize, auth.getUser);
app.delete(
	"/api/auth/logout",
	SQLSecurityMiddleware.auditLog("user_logout"),
	auth.logout
);

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
app.get("/api/pwdReset/validate/:token", passwordReset.validateToken);
app.put("/api/pwdReset/submit/:token", passwordReset.processReset);

// Security Monitoring Endpoints
app.get("/api/security/dashboard", authMiddleware.authorize, security.getSecurityDashboard);
app.get("/api/security/alerts", authMiddleware.authorize, security.getSecurityAlerts);
app.post("/api/security/block-ip/:ip", authMiddleware.authorize, security.blockIP);
app.post("/api/security/unblock-ip/:ip", authMiddleware.authorize, security.unblockIP);

// //Player endpoints
// Item Display //User Graph
app.get("/api/player/playcount/:id", player.getPlayerTotalPlays);
// Leaderboard
app.get("/api/player/leaderboard", player.getAllPlayersTotalPlays);

// Error handling middleware (must be after all routes)
const { expressErrorHandler } = require("./middleware/errorHandler");
app.use(expressErrorHandler);

// Catch-all handler for SPA - must be last route
if (config.nodeEnv === "production") {
	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, "../dist/index.html"));
	});
}

// Initialize database with security configuration
SecurityConfig.configureDatabaseSecurity(massive, config)
	.then((dbInstance) => {
		app.set("db", dbInstance);
		console.log(`🚀 Database connected with security settings`);

		app.listen(config.serverPort, () => {
			console.log(`🚀 Server running on port ${config.serverPort}`);
			console.log(`🌍 Environment: ${config.nodeEnv}`);
			console.log(
				`🔒 Security: ${
					config.nodeEnv === "production" ? "Production" : "Development"
				} mode`
			);
			console.log(
				`🏥 Health check: http://localhost:${config.serverPort}/api/health`
			);
		});
	})
	.catch((err) => {
		console.error("💥 Database connection failed:", err);
		process.exit(1);
	});
