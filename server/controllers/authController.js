const bcrypt = require("bcryptjs");
const { validatePassword } = require("../utils/passwordValidation");
const {
	validateRegistrationInput,
	validateLoginInput,
} = require("../utils/inputValidation");
const {
	recordFailedAttempt,
	clearFailedAttempts,
	isAccountLocked,
} = require("../middleware/enhancedRateLimiting");

module.exports = {
	register: async (req, res) => {
		const { email, username, password, first_name, last_name } = req.body;
		const db = req.app.get("db");

		// Validate and sanitize all input fields
		const inputValidation = validateRegistrationInput({
			email,
			username,
			password,
			first_name,
			last_name,
		});

		if (!inputValidation.isValid) {
			return res.status(400).json({
				error: "invalid_input",
				message: "Please correct the following issues:",
				errors: inputValidation.errors,
			});
		}

		// Use sanitized data
		const {
			email: sanitizedEmail,
			username: sanitizedUsername,
			first_name: sanitizedFirstName,
			last_name: sanitizedLastName,
		} = inputValidation.sanitized;

		// Validate password strength
		const passwordValidation = validatePassword(password);
		if (!passwordValidation.isValid) {
			return res.status(400).json({
				error: "invalid_password",
				message: passwordValidation.message,
			});
		}

		try {
			const salt = await bcrypt.genSalt(10);
			const hash = await bcrypt.hash(password, salt);

			// Check if email already exists
			const storedUserEmail = await db.user.getUserByEmail(sanitizedEmail);
			if (storedUserEmail.length > 0) {
				return res.status(409).json({
					error: "email_exists",
					message: "An account with this email already exists",
				});
			}

			// Check if username already exists
			const storedUserUsername = await db.user.getUserByUsername(
				sanitizedUsername
			);
			if (storedUserUsername.length > 0) {
				return res.status(409).json({
					error: "username_exists",
					message: "An account with this username already exists",
				});
			}

			// Create the user
			const user_id = await db.user.register(
				sanitizedEmail,
				sanitizedUsername,
				sanitizedFirstName,
				sanitizedLastName,
				hash
			);

			const newUser = {
				user_id: user_id[0].user_id,
				email: sanitizedEmail,
				username: sanitizedUsername,
				first_name: sanitizedFirstName,
				last_name: sanitizedLastName,
			};

			// Regenerate session ID to prevent session fixation
			req.session.regenerate((err) => {
				if (err) {
					console.error("Session regeneration error:", err);
					return res.status(500).json({
						error: "session_error",
						message: "Failed to create secure session",
					});
				}

				req.session.user = newUser;
				return res.status(201).json({
					success: true,
					user: newUser,
					message: "Account created successfully",
				});
			});
		} catch (err) {
			console.error("User registration error:", err);
			return res.status(500).json({
				error: "registration_failed",
				message: "Failed to create account. Please try again.",
			});
		}
	},
	login: async (req, res) => {
		const db = req.app.get("db");
		const { userCreds, password } = req.body;

		// Validate and sanitize input
		const inputValidation = validateLoginInput({ userCreds, password });

		if (!inputValidation.isValid) {
			return res.status(400).json({
				error: "invalid_input",
				message: "Please correct the following issues:",
				errors: inputValidation.errors,
			});
		}

		const { userCreds: sanitizedUserCreds } = inputValidation.sanitized;

		// Check if account is locked out (additional check beyond middleware)
		if (isAccountLocked(sanitizedUserCreds)) {
			return res.status(423).json({
				error: "account_locked",
				message:
					"Account temporarily locked due to too many failed login attempts. Please try again later.",
			});
		}

		try {
			const storedUser = await db.user.getUserHash(sanitizedUserCreds);
			if (storedUser.length === 0) {
				// Record failed attempt for non-existent user (still track attempts)
				recordFailedAttempt(sanitizedUserCreds);
				return res.status(404).json({
					error: "user_not_found",
					message: "Invalid username or email",
				});
			}

			const isPasswordValid = await bcrypt.compare(
				password,
				storedUser[0].hash
			);
			if (!isPasswordValid) {
				// Record failed login attempt
				const attemptInfo = recordFailedAttempt(sanitizedUserCreds);

				return res.status(403).json({
					error: "invalid_password",
					message: "Invalid password",
					attemptsRemaining: Math.max(0, 5 - attemptInfo.attempts), // Give user feedback
				});
			}

			// Clear any failed attempts on successful login
			clearFailedAttempts(sanitizedUserCreds);

			// Get user data
			const user = await db.user.getUser(sanitizedUserCreds);

			// Regenerate session ID to prevent session fixation
			req.session.regenerate((err) => {
				if (err) {
					console.error("Session regeneration error:", err);
					return res.status(500).json({
						error: "session_error",
						message: "Failed to create secure session",
					});
				}

				req.session.user = user[0];
				return res.status(200).json({
					success: true,
					user: user[0],
					message: "Login successful",
				});
			});
		} catch (err) {
			console.error("Login error:", err);
			return res.status(500).json({
				error: "server_error",
				message: "Internal server error",
			});
		}
	},

	logout: async (req, res) => {
		req.session.destroy();
		return res.sendStatus(200);
	},

	getUser: async (req, res) => {
		res.status(200).send(req.session.user);
	},
};
