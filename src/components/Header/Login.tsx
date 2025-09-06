import axios from "axios";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Slide } from "react-toastify";
import { getUserGames } from "../../redux/userGameReducer";
import { updateUser, User } from "../../redux/userReducer";
import Button from "../StyledComponents/Button";
import { usePasswordValidation } from "../../hooks/useFormValidation";
import { useFormValidation } from "../../hooks/useInputValidation";
import PasswordStrengthIndicator from "../StyledComponents/PasswordStrengthIndicator";

const Login: React.FC = () => {
	const [username, setUsername] = useState<string>("");
	const [firstName, setFirstName] = useState<string>("");
	const [lastName, setLastName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [loginPassword, setLoginPassword] = useState<string>("");
	const [userCreds, setUserCreds] = useState<string>("");
	const [resetDisabler, setResetDisabler] = useState(true);
	const [resetEmail, setResetEmail] = useState("");
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [isLogin, setIsLogin] = useState<boolean>(true);
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();

	// Password validation hook
	const { validatePassword, passwordStrength } = usePasswordValidation();

	// Form validation hook
	const { validateRegistrationForm, validateLoginForm } = useFormValidation();

	const toggleLogin = (): void => {
		setIsLogin(!isLogin);
	};

	const handlePasswordChange = (newPassword: string): void => {
		setPassword(newPassword);
		validatePassword(newPassword);
	};

	const register = (): void => {
		// Comprehensive form validation
		const formValidation = validateRegistrationForm({
			email: email.trim(),
			username: username.trim(),
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			password,
		});

		// Show validation errors
		if (!formValidation.isValid) {
			Object.values(formValidation.errors).forEach((error) => {
				toast.error(error);
			});
			return;
		}

		// Validate password strength
		const passwordValidation = validatePassword(password);
		if (!passwordValidation.isValid) {
			toast.error(passwordValidation.message);
			return;
		}

		setIsLoading(true);

		axios
			.post<User>("/api/auth/register", {
				username: username.trim(),
				first_name: firstName.trim(),
				last_name: lastName.trim(),
				email: email.trim(),
				password,
			})
			.then(async (res) => {
				// After successful registration, fetch the complete user profile
				// This ensures we get the same data structure as when logging in
				try {
					const userResponse = await axios.get<User>("/api/auth/user");
					const user = userResponse.data;
					if (user) {
						dispatch(updateUser(user));
						dispatch(getUserGames()); // Fetch user's games after registration
					}
				} catch (userErr) {
					console.error("Error fetching user after registration:", userErr);
					// Fallback to registration response data
					const user = res.data;
					dispatch(updateUser(user));
					dispatch(getUserGames());
				}

				setFirstName("");
				setLastName("");
				setEmail("");
				setUsername("");
				setPassword("");
				toast.success("Account created successfully!");
				navigate("/");
			})
			.catch((err) => {
				console.error("Registration error:", err);
				const errorData = err.response?.data;

				if (errorData?.error === "email_exists") {
					toast.error(
						"An account with this email already exists. Please use a different email or try logging in."
					);
				} else if (errorData?.error === "username_exists") {
					toast.error(
						"This username is already taken. Please choose a different username."
					);
				} else if (errorData?.error === "invalid_password") {
					toast.error(
						errorData.message || "Password does not meet requirements"
					);
				} else if (errorData?.error === "invalid_input") {
					// Show all backend validation errors
					if (errorData.errors && Array.isArray(errorData.errors)) {
						errorData.errors.forEach((error: string) => toast.error(error));
					} else {
						toast.error(
							errorData.message || "Please check your input and try again"
						);
					}
				} else if (errorData?.error === "rate_limit_exceeded") {
					toast.error(
						errorData.message || "Too many attempts. Please try again later."
					);
				} else {
					toast.error(
						errorData?.message || "Registration failed. Please try again."
					);
				}
			})
			.finally(() => {
				setIsLoading(false);
			});
	};

	const login = (): void => {
		// Validate login form
		const formValidation = validateLoginForm({
			userCreds: userCreds.trim(),
			password: loginPassword,
		});

		if (!formValidation.isValid) {
			Object.values(formValidation.errors).forEach((error) => {
				toast.error(error);
			});
			return;
		}

		setIsLoading(true);

		axios
			.post<User>("/api/auth/login", {
				userCreds: userCreds.trim(),
				password: loginPassword,
			})
			.then((res) => {
				const user = res.data.user || res.data; // Handle both response formats
				setUserCreds("");
				setLoginPassword("");
				dispatch(updateUser(user));
				dispatch(getUserGames());
				toast.success("Welcome back!");
				navigate("/");
			})
			.catch((err) => {
				console.error("Login error:", err);
				const errorData = err.response?.data;

				if (
					errorData?.error === "user_not_found" ||
					err.response?.status === 404
				) {
					toast.error(
						"No account found with this email or username. Please check your credentials or create a new account."
					);
				} else if (
					errorData?.error === "invalid_password" ||
					err.response?.status === 403
				) {
					toast.error("Incorrect password. Please try again.");
				} else if (errorData?.error === "invalid_input") {
					// Show all backend validation errors
					if (errorData.errors && Array.isArray(errorData.errors)) {
						errorData.errors.forEach((error: string) => toast.error(error));
					} else {
						toast.error(
							errorData.message || "Please check your input and try again"
						);
					}
				} else if (errorData?.error === "rate_limit_exceeded") {
					toast.error(
						errorData.message ||
							"Too many login attempts. Please try again later."
					);
				} else if (errorData === "userCreds" || errorData === "password") {
					// Handle legacy error responses
					if (errorData === "userCreds") {
						toast.error("No account found with this email or username.");
					} else {
						toast.error("Incorrect password. Please try again.");
					}
				} else {
					toast.error(errorData?.message || "Login failed. Please try again.");
				}
			})
			.finally(() => {
				setIsLoading(false);
			});
	};

	const submitResetReq = () => {
		setResetEmail("");
		axios
			.put("/api/pwdReset/req", { email: resetEmail })
			.then(() => toast.success("Please check your email for a reset link."))
			.catch(() => {
				toast.error(
					'We did not find a user with the username or email provided. Please register for an account using the "need to register?" button.'
				);
			});
	};

	return (
		<>
			<ToastContainer
				draggable={true}
				draggablePercent={80}
				autoClose={6000}
				position="top-center"
				transition={Slide}
				role="alert"
				aria-live="assertive"
				aria-atomic="true"
				toastClassName="accessible-toast"
			/>
			<div className="auth-container">
				<div className="auth-container__login-register">
					{isLogin ? (
						<form
							onSubmit={(e: React.SyntheticEvent) => {
								e.preventDefault();
								login();
							}}
							aria-labelledby="login-heading"
							role="main"
						>
							<h3 id="login-heading">Sign In to Your Account</h3>
							<div className="form-group">
								<label htmlFor="loginEmail" className="form-label">
									Email or Username
									<span
										className="required-indicator"
										aria-label="required field"
									>
										*
									</span>
								</label>
								<input
									id="loginEmail"
									type="text"
									autoComplete="username"
									value={userCreds}
									onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
										setUserCreds(e.target.value)
									}
									className="form-input"
									placeholder="Enter your email or username"
									aria-describedby="loginEmail-help"
									aria-required="true"
									disabled={isLoading}
								/>
								<div id="loginEmail-help" className="input-help">
									Enter the email address or username associated with your
									account
								</div>
							</div>

							<div className="form-group">
								<label htmlFor="loginPassword" className="form-label">
									Password
									<span
										className="required-indicator"
										aria-label="required field"
									>
										*
									</span>
								</label>
								<input
									type="password"
									id="loginPassword"
									autoComplete="current-password"
									value={loginPassword}
									onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
										setLoginPassword(e.target.value)
									}
									className="form-input"
									placeholder="Enter your password"
									aria-required="true"
									disabled={isLoading}
								/>
							</div>

							<div className="form-actions">
								<Button
									type="submit"
									variant="primary"
									loading={isLoading}
									disabled={isLoading}
									aria-describedby={isLoading ? "login-status" : undefined}
								>
									Sign In
								</Button>
								{isLoading && (
									<div
										id="login-status"
										className="sr-only"
										role="status"
										aria-live="polite"
									>
										Signing you in, please wait...
									</div>
								)}
							</div>

							<div className="form-footer">
								<Button
									type="button"
									variant="link"
									onClick={toggleLogin}
									aria-describedby="register-help"
								>
									Create New Account
								</Button>
								<div id="register-help" className="sr-only">
									Switch to account registration form
								</div>
							</div>
						</form>
					) : (
						<form
							onSubmit={(e: React.SyntheticEvent) => {
								e.preventDefault();
								register();
							}}
							aria-labelledby="register-heading"
							role="main"
						>
							<h3 id="register-heading">Create Your Account</h3>

							<div className="form-group">
								<label htmlFor="username" className="form-label">
									Username
									<span
										className="required-indicator"
										aria-label="required field"
									>
										*
									</span>
								</label>
								<input
									id="username"
									type="text"
									autoComplete="username"
									value={username}
									onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
										setUsername(e.target.value)
									}
									className="form-input"
									placeholder="Choose a unique username"
									aria-describedby="username-help"
									aria-required="true"
									disabled={isLoading}
								/>
								<div id="username-help" className="input-help">
									3-20 characters, letters, numbers, and underscores only
								</div>
							</div>

							<div className="form-group">
								<label htmlFor="firstName" className="form-label">
									First Name
									<span
										className="required-indicator"
										aria-label="required field"
									>
										*
									</span>
								</label>
								<input
									id="firstName"
									type="text"
									autoComplete="given-name"
									value={firstName}
									onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
										setFirstName(e.target.value)
									}
									className="form-input"
									placeholder="Enter your first name"
									aria-required="true"
									disabled={isLoading}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="lastName" className="form-label">
									Last Name
									<span
										className="required-indicator"
										aria-label="required field"
									>
										*
									</span>
								</label>
								<input
									id="lastName"
									type="text"
									autoComplete="family-name"
									value={lastName}
									onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
										setLastName(e.target.value)
									}
									className="form-input"
									placeholder="Enter your last name"
									aria-required="true"
									disabled={isLoading}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="email" className="form-label">
									Email Address
									<span
										className="required-indicator"
										aria-label="required field"
									>
										*
									</span>
								</label>
								<input
									id="email"
									type="email"
									autoComplete="email"
									value={email}
									onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
										setEmail(e.target.value)
									}
									className="form-input"
									placeholder="Enter your email address"
									aria-describedby="email-help"
									aria-required="true"
									disabled={isLoading}
								/>
								<div id="email-help" className="input-help">
									We'll use this to send you account updates and password resets
								</div>
							</div>

							<div className="form-group">
								<label htmlFor="password" className="form-label">
									Password
									<span
										className="required-indicator"
										aria-label="required field"
									>
										*
									</span>
								</label>
								<input
									type="password"
									id="password"
									autoComplete="new-password"
									value={password}
									onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
										handlePasswordChange(e.target.value)
									}
									className="form-input"
									placeholder="Create a strong password"
									aria-describedby="password-strength password-requirements"
									aria-required="true"
									disabled={isLoading}
								/>
								{password && (
									<div id="password-strength" style={{ marginTop: "8px" }}>
										<PasswordStrengthIndicator
											score={passwordStrength.score}
											feedback={passwordStrength.feedback}
											requirements={passwordStrength.requirements}
											showRequirements={true}
										/>
									</div>
								)}
								<div id="password-requirements" className="input-help">
									Password must be at least 8 characters with uppercase,
									lowercase, and numbers
								</div>
							</div>

							<div className="form-actions">
								<Button
									type="submit"
									variant="primary"
									loading={isLoading}
									disabled={isLoading}
									aria-describedby={isLoading ? "register-status" : undefined}
								>
									Create Account
								</Button>
								{isLoading && (
									<div
										id="register-status"
										className="sr-only"
										role="status"
										aria-live="polite"
									>
										Creating your account, please wait...
									</div>
								)}
							</div>

							<div className="form-footer">
								<Button
									type="button"
									variant="link"
									onClick={toggleLogin}
									aria-describedby="login-help"
								>
									Already have an account? Sign in
								</Button>
								<div id="login-help" className="sr-only">
									Switch to sign in form
								</div>
							</div>
						</form>
					)}
					<div className="auth-container__reset-password">
						<fieldset aria-labelledby="reset-legend">
							<legend id="reset-legend" className="sr-only">
								Password Reset Section
							</legend>
							{resetDisabler ? (
								<Button
									type="button"
									variant="link"
									onClick={() => setResetDisabler(!resetDisabler)}
									aria-expanded="false"
									aria-controls="reset-form"
									aria-describedby="reset-help"
								>
									Forgot your password?
								</Button>
							) : (
								<div
									id="reset-form"
									role="group"
									aria-labelledby="reset-form-heading"
								>
									<h4 id="reset-form-heading" className="sr-only">
										Reset Password Form
									</h4>
									<div className="form-group">
										<label
											htmlFor="passwordResetRequest"
											className="form-label"
										>
											Email Address for Password Reset
											<span
												className="required-indicator"
												aria-label="required field"
											>
												*
											</span>
										</label>
										<input
											value={resetEmail}
											id="passwordResetRequest"
											type="email"
											autoComplete="email"
											placeholder="Enter your email address"
											disabled={resetDisabler}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												setResetEmail(e.target.value)
											}
											className="form-input"
											aria-describedby="reset-email-help"
											aria-required="true"
										/>
										<div id="reset-email-help" className="input-help">
											We'll send password reset instructions to this email
										</div>
									</div>

									<div className="form-actions">
										<Button
											type="button"
											variant="primary"
											onClick={() => submitResetReq()}
											aria-describedby="reset-submit-help"
										>
											Send Reset Email
										</Button>
										<Button
											type="button"
											variant="secondary"
											onClick={() => setResetDisabler(!resetDisabler)}
											aria-expanded="true"
											aria-controls="reset-form"
										>
											Cancel
										</Button>
										<div id="reset-submit-help" className="sr-only">
											Submit password reset request
										</div>
									</div>
								</div>
							)}
							<div id="reset-help" className="sr-only">
								Expand password reset form to recover your account
							</div>
						</fieldset>
					</div>
				</div>
			</div>
		</>
	);
};

export default Login;
