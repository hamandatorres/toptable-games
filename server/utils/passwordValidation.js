/**
 * Password validation utility for TopTable Games
 * Enforces strong password requirements for security
 */

const validatePassword = (password) => {
	if (!password || typeof password !== "string") {
		return {
			isValid: false,
			message: "Password is required",
		};
	}

	const minLength = 8;
	const maxLength = 128; // Prevent extremely long passwords
	const hasUpperCase = /[A-Z]/.test(password);
	const hasLowerCase = /[a-z]/.test(password);
	const hasNumbers = /\d/.test(password);
	const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

	// Check length first
	if (password.length < minLength) {
		return {
			isValid: false,
			message: `Password must be at least ${minLength} characters long`,
		};
	}

	if (password.length > maxLength) {
		return {
			isValid: false,
			message: `Password must not exceed ${maxLength} characters`,
		};
	}

	// Check complexity requirements
	if (!hasUpperCase) {
		return {
			isValid: false,
			message: "Password must contain at least one uppercase letter",
		};
	}

	if (!hasLowerCase) {
		return {
			isValid: false,
			message: "Password must contain at least one lowercase letter",
		};
	}

	if (!hasNumbers) {
		return {
			isValid: false,
			message: "Password must contain at least one number",
		};
	}

	// All requirements met
	return {
		isValid: true,
		message: "Password meets all requirements",
	};
};

/**
 * Get password strength score (0-4)
 * @param {string} password
 * @returns {object} { score: number, feedback: string }
 */
const getPasswordStrength = (password) => {
	if (!password) return { score: 0, feedback: "Password required" };

	let score = 0;
	const feedback = [];

	// Length scoring
	if (password.length >= 8) score++;
	if (password.length >= 12) score++;

	// Character type scoring
	if (/[A-Z]/.test(password)) score++;
	if (/[a-z]/.test(password)) score++;
	if (/\d/.test(password)) score++;
	if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

	// Deduct for common patterns
	if (/(.)\1{2,}/.test(password)) score--; // Repeated characters
	if (/123|abc|qwe/i.test(password)) score--; // Sequential patterns

	// Ensure score stays within bounds
	score = Math.max(0, Math.min(4, score));

	const strengthLevels = {
		0: "Very Weak",
		1: "Weak",
		2: "Fair",
		3: "Good",
		4: "Strong",
	};

	return {
		score,
		feedback: strengthLevels[score],
	};
};

module.exports = {
	validatePassword,
	getPasswordStrength,
};
