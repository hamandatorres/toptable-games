import { useState, useCallback } from "react";

/**
 * Password validation hook for real-time feedback
 */
export const usePasswordValidation = () => {
	const [passwordStrength, setPasswordStrength] = useState({
		score: 0,
		feedback: "",
		requirements: {
			length: false,
			uppercase: false,
			lowercase: false,
			number: false,
			special: false,
		},
	});

	const validatePassword = useCallback((password: string) => {
		if (!password) {
			setPasswordStrength({
				score: 0,
				feedback: "Password required",
				requirements: {
					length: false,
					uppercase: false,
					lowercase: false,
					number: false,
					special: false,
				},
			});
			return {
				isValid: false,
				message: "Password is required",
			};
		}

		const minLength = 8;
		const maxLength = 128;
		const hasUpperCase = /[A-Z]/.test(password);
		const hasLowerCase = /[a-z]/.test(password);
		const hasNumbers = /\d/.test(password);
		const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
		const hasValidLength =
			password.length >= minLength && password.length <= maxLength;

		// Update requirements tracking
		const requirements = {
			length: hasValidLength,
			uppercase: hasUpperCase,
			lowercase: hasLowerCase,
			number: hasNumbers,
			special: hasSpecialChars,
		};

		// Calculate strength score
		let score = 0;
		if (hasValidLength) score++;
		if (hasUpperCase) score++;
		if (hasLowerCase) score++;
		if (hasNumbers) score++;
		if (hasSpecialChars) score++;

		// Provide feedback
		const strengthLevels: Record<number, string> = {
			0: "Very Weak",
			1: "Weak",
			2: "Fair",
			3: "Good",
			4: "Strong",
			5: "Very Strong",
		};

		setPasswordStrength({
			score,
			feedback: strengthLevels[score] || "Very Weak",
			requirements,
		});

		// Validate requirements
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

		return {
			isValid: true,
			message: "Password meets all requirements",
		};
	}, []);

	return {
		validatePassword,
		passwordStrength,
	};
};

interface ValidationRule {
	(value: string): { isValid: boolean; message: string };
}

interface ValidationRules {
	[key: string]: ValidationRule;
}

interface FormValues {
	[key: string]: string;
}

/**
 * General form validation hook
 */
export const useFormValidation = (
	initialState: FormValues,
	validationRules: ValidationRules
) => {
	const [values, setValues] = useState<FormValues>(initialState);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	const validateField = useCallback(
		(name: string, value: string) => {
			const rule = validationRules[name];
			if (rule && typeof rule === "function") {
				const result = rule(value);
				return result.isValid ? "" : result.message;
			}
			return "";
		},
		[validationRules]
	);

	const handleChange = useCallback(
		(name: string, value: string) => {
			setValues((prev: FormValues) => ({ ...prev, [name]: value }));

			if (touched[name]) {
				const error = validateField(name, value);
				setErrors((prev) => ({ ...prev, [name]: error }));
			}
		},
		[touched, validateField]
	);

	const handleBlur = useCallback(
		(name: string) => {
			setTouched((prev) => ({ ...prev, [name]: true }));
			const error = validateField(name, values[name] || "");
			setErrors((prev) => ({ ...prev, [name]: error }));
		},
		[values, validateField]
	);

	const validateAll = useCallback(() => {
		const newErrors: Record<string, string> = {};
		let isValid = true;

		Object.keys(validationRules).forEach((field) => {
			const error = validateField(field, values[field] || "");
			if (error) {
				newErrors[field] = error;
				isValid = false;
			}
		});

		setErrors(newErrors);
		setTouched(
			Object.keys(validationRules).reduce((acc, field) => {
				acc[field] = true;
				return acc;
			}, {} as Record<string, boolean>)
		);

		return isValid;
	}, [values, validationRules, validateField]);

	return {
		values,
		errors,
		touched,
		handleChange,
		handleBlur,
		validateAll,
		setValues,
		setErrors,
		setTouched,
	};
};
