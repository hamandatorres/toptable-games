import { useState, useCallback } from "react";

// Frontend validation utilities that match backend validation
export interface ValidationResult {
	isValid: boolean;
	message?: string;
	errors?: string[];
}

export interface FormValidationResult {
	isValid: boolean;
	errors: Record<string, string>;
}

/**
 * Email validation hook
 */
export const useEmailValidation = () => {
	const [emailError, setEmailError] = useState<string>("");

	const validateEmail = useCallback((email: string): ValidationResult => {
		if (!email) {
			const error = "Email is required";
			setEmailError(error);
			return { isValid: false, message: error };
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			const error = "Please enter a valid email address";
			setEmailError(error);
			return { isValid: false, message: error };
		}

		if (email.length > 254) {
			const error = "Email address is too long";
			setEmailError(error);
			return { isValid: false, message: error };
		}

		setEmailError("");
		return { isValid: true };
	}, []);

	return { validateEmail, emailError };
};

/**
 * Username validation hook
 */
export const useUsernameValidation = () => {
	const [usernameError, setUsernameError] = useState<string>("");

	const validateUsername = useCallback((username: string): ValidationResult => {
		if (!username) {
			const error = "Username is required";
			setUsernameError(error);
			return { isValid: false, message: error };
		}

		// Username: 3-20 characters, alphanumeric and underscores only
		const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
		if (!usernameRegex.test(username)) {
			const error =
				"Username must be 3-20 characters and contain only letters, numbers, and underscores";
			setUsernameError(error);
			return { isValid: false, message: error };
		}

		setUsernameError("");
		return { isValid: true };
	}, []);

	return { validateUsername, usernameError };
};

/**
 * Name validation hook (for first name, last name)
 */
export const useNameValidation = () => {
	const validateName = useCallback(
		(name: string, fieldName: string = "Name"): ValidationResult => {
			if (!name) {
				return { isValid: false, message: `${fieldName} is required` };
			}

			// Name: 1-50 characters, letters, spaces, hyphens, apostrophes only
			const nameRegex = /^[a-zA-Z\s\-']{1,50}$/;
			if (!nameRegex.test(name)) {
				return {
					isValid: false,
					message: `${fieldName} must be 1-50 characters and contain only letters, spaces, hyphens, and apostrophes`,
				};
			}

			return { isValid: true };
		},
		[]
	);

	return { validateName };
};

/**
 * User credentials validation hook (for login - username or email)
 */
export const useUserCredsValidation = () => {
	const [userCredsError, setUserCredsError] = useState<string>("");

	const validateUserCreds = useCallback(
		(userCreds: string): ValidationResult => {
			if (!userCreds) {
				const error = "Username or email is required";
				setUserCredsError(error);
				return { isValid: false, message: error };
			}

			// Could be either username or email
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

			const isEmail = emailRegex.test(userCreds);
			const isUsername = usernameRegex.test(userCreds);

			if (!isEmail && !isUsername) {
				const error = "Please enter a valid username or email address";
				setUserCredsError(error);
				return { isValid: false, message: error };
			}

			setUserCredsError("");
			return { isValid: true };
		},
		[]
	);

	return { validateUserCreds, userCredsError };
};

/**
 * Complete form validation hook
 */
export const useFormValidation = () => {
	const { validateEmail } = useEmailValidation();
	const { validateUsername } = useUsernameValidation();
	const { validateName } = useNameValidation();
	const { validateUserCreds } = useUserCredsValidation();

	const validateRegistrationForm = useCallback(
		(formData: {
			email: string;
			username: string;
			firstName: string;
			lastName: string;
			password: string;
		}): FormValidationResult => {
			const errors: Record<string, string> = {};

			// Validate email
			const emailValidation = validateEmail(formData.email);
			if (!emailValidation.isValid) {
				errors.email = emailValidation.message || "Invalid email";
			}

			// Validate username
			const usernameValidation = validateUsername(formData.username);
			if (!usernameValidation.isValid) {
				errors.username = usernameValidation.message || "Invalid username";
			}

			// Validate first name
			const firstNameValidation = validateName(
				formData.firstName,
				"First name"
			);
			if (!firstNameValidation.isValid) {
				errors.firstName = firstNameValidation.message || "Invalid first name";
			}

			// Validate last name
			const lastNameValidation = validateName(formData.lastName, "Last name");
			if (!lastNameValidation.isValid) {
				errors.lastName = lastNameValidation.message || "Invalid last name";
			}

			// Password validation is handled separately by usePasswordValidation

			return {
				isValid: Object.keys(errors).length === 0,
				errors,
			};
		},
		[validateEmail, validateUsername, validateName]
	);

	const validateLoginForm = useCallback(
		(formData: {
			userCreds: string;
			password: string;
		}): FormValidationResult => {
			const errors: Record<string, string> = {};

			// Validate user credentials
			const userCredsValidation = validateUserCreds(formData.userCreds);
			if (!userCredsValidation.isValid) {
				errors.userCreds =
					userCredsValidation.message || "Invalid username or email";
			}

			// Validate password exists
			if (!formData.password) {
				errors.password = "Password is required";
			}

			return {
				isValid: Object.keys(errors).length === 0,
				errors,
			};
		},
		[validateUserCreds]
	);

	return {
		validateRegistrationForm,
		validateLoginForm,
		validateEmail,
		validateUsername,
		validateName,
		validateUserCreds,
	};
};
