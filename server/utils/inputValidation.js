const validator = require("validator");

/**
 * Input validation and sanitization utilities
 * Provides XSS protection and format validation
 */

/**
 * Sanitize input by trimming whitespace and escaping HTML
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string safe from XSS
 */
const sanitizeInput = (input) => {
	if (!input || typeof input !== "string") {
		return "";
	}
	return validator.escape(validator.trim(input));
};

/**
 * Validate email format and length
 * @param {string} email - Email to validate
 * @returns {object} - Validation result with isValid and message
 */
const validateEmail = (email) => {
	if (!email) {
		return {
			isValid: false,
			message: "Email is required",
		};
	}

	const sanitizedEmail = sanitizeInput(email.toLowerCase());

	if (!validator.isEmail(sanitizedEmail)) {
		return {
			isValid: false,
			message: "Please enter a valid email address",
		};
	}

	if (sanitizedEmail.length > 254) {
		return {
			isValid: false,
			message: "Email address is too long",
		};
	}

	return {
		isValid: true,
		sanitized: sanitizedEmail,
	};
};

/**
 * Validate username format and length
 * @param {string} username - Username to validate
 * @returns {object} - Validation result with isValid and message
 */
const validateUsername = (username) => {
	if (!username) {
		return {
			isValid: false,
			message: "Username is required",
		};
	}

	const sanitizedUsername = sanitizeInput(username);

	// Username: 3-20 characters, alphanumeric and underscores only
	const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

	if (!usernameRegex.test(sanitizedUsername)) {
		return {
			isValid: false,
			message:
				"Username must be 3-20 characters and contain only letters, numbers, and underscores",
		};
	}

	return {
		isValid: true,
		sanitized: sanitizedUsername.toLowerCase(),
	};
};

/**
 * Validate name fields (first name, last name)
 * @param {string} name - Name to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {object} - Validation result with isValid and message
 */
const validateName = (name, fieldName = "Name") => {
	if (!name) {
		return {
			isValid: false,
			message: `${fieldName} is required`,
		};
	}

	const sanitizedName = sanitizeInput(name);

	// Name: 1-50 characters, letters, spaces, hyphens, apostrophes only
	const nameRegex = /^[a-zA-Z\s\-']{1,50}$/;

	if (!nameRegex.test(sanitizedName)) {
		return {
			isValid: false,
			message: `${fieldName} must be 1-50 characters and contain only letters, spaces, hyphens, and apostrophes`,
		};
	}

	return {
		isValid: true,
		sanitized: sanitizedName,
	};
};

/**
 * Validate user credentials (username or email for login)
 * @param {string} userCreds - User credentials to validate
 * @returns {object} - Validation result with isValid and message
 */
const validateUserCreds = (userCreds) => {
	if (!userCreds) {
		return {
			isValid: false,
			message: "Username or email is required",
		};
	}

	const sanitizedCreds = sanitizeInput(userCreds.toLowerCase());

	// Could be either username or email
	const isEmail = validator.isEmail(sanitizedCreds);
	const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
	const isUsername = usernameRegex.test(sanitizedCreds);

	if (!isEmail && !isUsername) {
		return {
			isValid: false,
			message: "Please enter a valid username or email address",
		};
	}

	return {
		isValid: true,
		sanitized: sanitizedCreds,
	};
};

/**
 * Comprehensive input validation for registration
 * @param {object} userData - Object containing all user registration data
 * @returns {object} - Validation result with isValid, errors, and sanitized data
 */
const validateRegistrationInput = (userData) => {
	const { email, username, password, first_name, last_name } = userData;
	const errors = [];
	const sanitized = {};

	// Validate email
	const emailValidation = validateEmail(email);
	if (!emailValidation.isValid) {
		errors.push(emailValidation.message);
	} else {
		sanitized.email = emailValidation.sanitized;
	}

	// Validate username
	const usernameValidation = validateUsername(username);
	if (!usernameValidation.isValid) {
		errors.push(usernameValidation.message);
	} else {
		sanitized.username = usernameValidation.sanitized;
	}

	// Validate first name
	const firstNameValidation = validateName(first_name, "First name");
	if (!firstNameValidation.isValid) {
		errors.push(firstNameValidation.message);
	} else {
		sanitized.first_name = firstNameValidation.sanitized;
	}

	// Validate last name
	const lastNameValidation = validateName(last_name, "Last name");
	if (!lastNameValidation.isValid) {
		errors.push(lastNameValidation.message);
	} else {
		sanitized.last_name = lastNameValidation.sanitized;
	}

	// Password will be validated separately by passwordValidation.js

	return {
		isValid: errors.length === 0,
		errors: errors,
		sanitized: sanitized,
	};
};

/**
 * Comprehensive input validation for login
 * @param {object} loginData - Object containing login data
 * @returns {object} - Validation result with isValid, errors, and sanitized data
 */
const validateLoginInput = (loginData) => {
	const { userCreds, password } = loginData;
	const errors = [];
	const sanitized = {};

	// Validate user credentials
	const userCredsValidation = validateUserCreds(userCreds);
	if (!userCredsValidation.isValid) {
		errors.push(userCredsValidation.message);
	} else {
		sanitized.userCreds = userCredsValidation.sanitized;
	}

	// Validate password exists (format validation happens separately)
	if (!password) {
		errors.push("Password is required");
	}

	return {
		isValid: errors.length === 0,
		errors: errors,
		sanitized: sanitized,
	};
};

module.exports = {
	sanitizeInput,
	validateEmail,
	validateUsername,
	validateName,
	validateUserCreds,
	validateRegistrationInput,
	validateLoginInput,
};
