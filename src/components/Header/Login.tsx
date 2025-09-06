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
			/>
			<div className="auth-container">
				<div className="auth-container__login-register">
					{isLogin ? (
						<form
							onSubmit={(e: React.SyntheticEvent) => {
								e.preventDefault();
								login();
							}}
						>
							<h3>login</h3>
							<label htmlFor="loginEmail">email:</label>
							<input
								id="loginEmail"
								value={userCreds}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
									setUserCreds(e.target.value)
								}
							/>
							<br></br>
							<label htmlFor="loginPassword">password:</label>
							<input
								type="password"
								id="loginPassword"
								value={loginPassword}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
									setLoginPassword(e.target.value)
								}
							/>
							<br></br>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? "Logging in..." : "login"}
							</Button>
							<br />
							<Button type="button" onClick={toggleLogin}>
								register
							</Button>
						</form>
					) : (
						<form
							onSubmit={(e: React.SyntheticEvent) => {
								e.preventDefault();
								register();
							}}
						>
							<h3>register</h3>
							<label htmlFor="username">username:</label>
							<input
								id="username"
								value={username}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
									setUsername(e.target.value)
								}
							/>
							<br></br>
							<label htmlFor="firstName">first name:</label>
							<input
								id="firstName"
								value={firstName}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
									setFirstName(e.target.value)
								}
							/>
							<br></br>
							<label htmlFor="lastName">last name:</label>
							<input
								id="lastName"
								value={lastName}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
									setLastName(e.target.value)
								}
							/>
							<br></br>
							<label htmlFor="email">email:</label>
							<input
								id="email"
								value={email}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
									setEmail(e.target.value)
								}
							/>
							<br></br>
							<label htmlFor="password">password:</label>
							<input
								type="password"
								id="password"
								value={password}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
									handlePasswordChange(e.target.value)
								}
								aria-describedby="password-strength"
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
							<br></br>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? "Creating Account..." : "register"}
							</Button>
							<div className="auth-container__already-registered">
								<span className="clickable" onClick={toggleLogin}>
									already register?
								</span>
							</div>
						</form>
					)}
					<div className="auth-container__reset-password">
						{resetDisabler ? (
							<span
								className="clickable"
								onClick={() => setResetDisabler(!resetDisabler)}
							>
								reset password
							</span>
						) : (
							<>
								<input
									value={resetEmail}
									id="passwordResetRequest"
									placeholder="email"
									disabled={resetDisabler}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setResetEmail(e.target.value)
									}
								></input>
								<br />
								<Button
									className="auth-container__reset-button"
									onClick={() => submitResetReq()}
								>
									request reset
								</Button>
								<Button onClick={() => setResetDisabler(!resetDisabler)}>
									cancel
								</Button>
							</>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default Login;
