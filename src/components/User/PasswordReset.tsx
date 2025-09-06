import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../StyledComponents/Button";
import PasswordStrengthIndicator from "../StyledComponents/PasswordStrengthIndicator";
import { ToastContainer, toast, Slide } from "react-toastify";
import axios, { AxiosResponse } from "axios";
import { User } from "customTypes";
import { usePasswordValidation } from "../../hooks/useFormValidation";
import { updateUser } from "../../redux/userReducer";

interface TokenValidationResponse {
	valid: boolean;
	expiresAt?: string;
	error?: string;
}

const PasswordReset: React.FC = () => {
	const [newPassword, setNewPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isValidatingToken, setIsValidatingToken] = useState<boolean>(true);
	const [tokenValid, setTokenValid] = useState<boolean>(false);
	const [tokenExpiration, setTokenExpiration] = useState<string>("");
	const [timeRemaining, setTimeRemaining] = useState<string>("");
	const [passwordsMatch, setPasswordsMatch] = useState<boolean>(true);
	const [confirmPasswordTouched, setConfirmPasswordTouched] =
		useState<boolean>(false);

	const { token } = useParams<{ token: string }>();
	const dispatch = useDispatch();
	const navigate = useNavigate();

	// Password validation hook
	const { validatePassword, passwordStrength } = usePasswordValidation();

	// Validate token on component mount
	useEffect(() => {
		const validateToken = async (): Promise<void> => {
			if (!token) {
				setTokenValid(false);
				setIsValidatingToken(false);
				toast.error("Invalid reset link. Please request a new password reset.");
				return;
			}

			try {
				const response = await axios.get<TokenValidationResponse>(
					`/api/pwdReset/validate/${token}`
				);

				if (response.data.valid) {
					setTokenValid(true);
					if (response.data.expiresAt) {
						setTokenExpiration(response.data.expiresAt);
					}
				} else {
					setTokenValid(false);
					toast.error(
						response.data.error ||
							"Reset link has expired. Please request a new password reset."
					);
				}
			} catch (error) {
				console.error("Token validation error:", error);
				setTokenValid(false);
				toast.error(
					"Reset link has expired or is invalid. Please request a new password reset."
				);
			} finally {
				setIsValidatingToken(false);
			}
		};

		validateToken();
	}, [token]);

	// Update time remaining countdown
	useEffect(() => {
		if (!tokenExpiration) return;

		const updateTime = (): void => {
			const now = new Date().getTime();
			const expiration = new Date(tokenExpiration).getTime();
			const difference = expiration - now;

			if (difference > 0) {
				const hours = Math.floor(difference / (1000 * 60 * 60));
				const minutes = Math.floor(
					(difference % (1000 * 60 * 60)) / (1000 * 60)
				);
				const seconds = Math.floor((difference % (1000 * 60)) / 1000);

				if (hours > 0) {
					setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
				} else if (minutes > 0) {
					setTimeRemaining(`${minutes}m ${seconds}s`);
				} else {
					setTimeRemaining(`${seconds}s`);
				}
			} else {
				setTimeRemaining("Expired");
				setTokenValid(false);
				toast.error(
					"Reset link has expired. Please request a new password reset."
				);
			}
		};

		updateTime(); // Initial call
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	}, [tokenExpiration]);

	// Check password confirmation match
	useEffect(() => {
		if (confirmPasswordTouched && confirmPassword) {
			setPasswordsMatch(newPassword === confirmPassword);
		}
	}, [newPassword, confirmPassword, confirmPasswordTouched]);

	const handlePasswordChange = (password: string): void => {
		setNewPassword(password);
		validatePassword(password);
	};

	const handleConfirmPasswordChange = (password: string): void => {
		setConfirmPassword(password);
		if (!confirmPasswordTouched) {
			setConfirmPasswordTouched(true);
		}
	};

	const validateForm = (): boolean => {
		// Validate password strength
		const passwordValidation = validatePassword(newPassword);
		if (!passwordValidation.isValid) {
			toast.error(passwordValidation.message);
			return false;
		}

		// Check password confirmation
		if (newPassword !== confirmPassword) {
			toast.error(
				"Passwords do not match. Please ensure both password fields are identical."
			);
			return false;
		}

		// Check minimum requirements
		if (newPassword.length < 8) {
			toast.error("Password must be at least 8 characters long.");
			return false;
		}

		return true;
	};

	const saveChanges = async (): Promise<void> => {
		if (!validateForm()) {
			return;
		}

		setIsLoading(true);

		try {
			const response: AxiosResponse<User> = await axios.put(
				`/api/pwdReset/submit/${token}`,
				{
					newPassword,
				}
			);

			const user = response.data;
			// Map API response to Redux user format
			dispatch(
				updateUser({
					user_id: 1, // Will be set properly by the server response
					username: user.username,
					email: user.email,
					first_name: user.firstName || "",
					last_name: user.lastName || "",
				})
			);

			toast.success("Password reset successfully! You are now logged in.");

			// Redirect after successful reset
			setTimeout(() => {
				navigate("/");
			}, 2000);
		} catch (error: unknown) {
			console.error("Password reset error:", error);

			const axiosError = error as {
				response?: {
					status?: number;
					data?: { error?: string; message?: string };
				};
			};
			const errorData = axiosError.response?.data;

			if (axiosError.response?.status === 403) {
				toast.error(
					"Reset link has expired. Please request a new password reset."
				);
				setTokenValid(false);
			} else if (errorData?.error === "invalid_password") {
				toast.error(
					errorData.message || "Password does not meet security requirements."
				);
			} else if (errorData?.error === "token_expired") {
				toast.error(
					"Reset link has expired. Please request a new password reset."
				);
				setTokenValid(false);
			} else {
				toast.error(
					errorData?.message || "Failed to reset password. Please try again."
				);
			}
		} finally {
			setIsLoading(false);
		}
	};

	if (isValidatingToken) {
		return (
			<div className="password-reset-page">
				<div className="loading-container" role="status" aria-live="polite">
					<div className="loading-spinner" aria-hidden="true"></div>
					<span className="sr-only">Validating reset link...</span>
					<p>Validating your reset link...</p>
				</div>
			</div>
		);
	}

	if (!tokenValid) {
		return (
			<>
				<ToastContainer
					draggable={true}
					draggablePercent={80}
					autoClose={8000}
					position="top-center"
					transition={Slide}
					role="alert"
					aria-live="assertive"
				/>
				<div className="password-reset-page">
					<div className="reset-error-container" role="main">
						<h2>Reset Link Invalid</h2>
						<p>This password reset link has expired or is invalid.</p>
						<div className="form-actions">
							<Button
								variant="primary"
								onClick={() => navigate("/login")}
								aria-describedby="return-login-help"
							>
								Return to Login
							</Button>
							<div id="return-login-help" className="sr-only">
								Return to login page to request a new password reset
							</div>
						</div>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<ToastContainer
				draggable={true}
				draggablePercent={80}
				autoClose={8000}
				position="top-center"
				transition={Slide}
				role="alert"
				aria-live="assertive"
			/>
			<div className="password-reset-page">
				<div className="password-reset-container" role="main">
					<header className="reset-header">
						<h2>Set Your New Password</h2>
						{timeRemaining && timeRemaining !== "Expired" && (
							<div
								className="token-expiration"
								role="status"
								aria-live="polite"
							>
								<span className="expiration-label">Link expires in:</span>
								<span
									className="expiration-time"
									aria-label={`Time remaining: ${timeRemaining}`}
								>
									{timeRemaining}
								</span>
							</div>
						)}
					</header>

					<form
						className="password-reset-form"
						onSubmit={(e) => {
							e.preventDefault();
							void saveChanges();
						}}
						noValidate
					>
						<div className="form-group">
							<label htmlFor="new-password" className="form-label">
								New Password
								<span className="required-indicator" aria-label="required">
									*
								</span>
							</label>
							<input
								id="new-password"
								type="password"
								className={`form-input ${
									newPassword && passwordStrength.score >= 3 ? "valid" : ""
								} ${
									newPassword && passwordStrength.score < 3 ? "invalid" : ""
								}`}
								value={newPassword}
								onChange={(e) => handlePasswordChange(e.target.value)}
								placeholder="Enter your new password"
								required
								disabled={isLoading}
								aria-describedby="password-strength new-password-help"
								aria-invalid={newPassword ? passwordStrength.score < 3 : false}
								autoComplete="new-password"
							/>
							<div id="new-password-help" className="form-help">
								Password must be at least 8 characters with a mix of letters,
								numbers, and symbols
							</div>
						</div>

						<PasswordStrengthIndicator
							score={passwordStrength.score}
							feedback={passwordStrength.feedback}
							requirements={passwordStrength.requirements}
							showRequirements={true}
						/>

						<div className="form-group">
							<label htmlFor="confirm-password" className="form-label">
								Confirm New Password
								<span className="required-indicator" aria-label="required">
									*
								</span>
							</label>
							<input
								id="confirm-password"
								type="password"
								className={`form-input ${
									confirmPasswordTouched && passwordsMatch && confirmPassword
										? "valid"
										: ""
								} ${
									confirmPasswordTouched && !passwordsMatch ? "invalid" : ""
								}`}
								value={confirmPassword}
								onChange={(e) => handleConfirmPasswordChange(e.target.value)}
								placeholder="Confirm your new password"
								required
								disabled={isLoading}
								aria-describedby="confirm-password-help"
								aria-invalid={confirmPasswordTouched ? !passwordsMatch : false}
								autoComplete="new-password"
							/>
							<div id="confirm-password-help" className="form-help">
								{confirmPasswordTouched &&
									!passwordsMatch &&
									confirmPassword && (
										<span className="error-text" role="alert">
											Passwords do not match
										</span>
									)}
								{confirmPasswordTouched &&
									passwordsMatch &&
									confirmPassword && (
										<span className="success-text" role="status">
											Passwords match
										</span>
									)}
							</div>
						</div>

						<div className="form-actions">
							<Button
								type="submit"
								variant="primary"
								loading={isLoading}
								disabled={
									isLoading ||
									!newPassword ||
									!confirmPassword ||
									!passwordsMatch ||
									passwordStrength.score < 3
								}
								aria-describedby="reset-button-help"
							>
								{isLoading ? "Resetting Password..." : "Reset Password"}
							</Button>
							<div id="reset-button-help" className="sr-only">
								Submit the form to reset your password with the new password you
								entered
							</div>
						</div>

						<div className="form-footer">
							<Button
								type="button"
								variant="secondary"
								onClick={() => navigate("/login")}
								disabled={isLoading}
							>
								Back to Login
							</Button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
};

export default PasswordReset;
