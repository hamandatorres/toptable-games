import axios from "axios";
import { User } from "customTypes";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import { ToastContainer, toast, Slide } from "react-toastify";
import { getUserGames } from "../../redux/userGameReducer";
import Button from "../StyledComponents/Button";

const Login: React.FC<RouteComponentProps> = (props: RouteComponentProps) => {
	const [username, setUsername] = useState<string>("");
	const [firstName, setFirstName] = useState<string>("");
	const [lastName, setLastName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [loginPassword, setLoginPassword] = useState<string>("");
	const [userCreds, setUserCreds] = useState<string>("");
	const [resetDisabler, setResetDisabler] = useState(true);
	const [resetEmail, setResetEmail] = useState("");

	const [isLogin, setIsLogin] = useState<boolean>(true);

	const dispatch = useDispatch();

	const toggleLogin = (): void => {
		setIsLogin(!isLogin);
	};

	const register = (): void => {
		axios
			.post<User>("/api/auth/register", {
				username,
				first_name: firstName,
				last_name: lastName,
				email,
				password,
			})
			.then((res) => {
				const user = res.data;
				dispatch({ type: "UPDATE_USER", payload: user });
				setFirstName("");
				setLastName("");
				setEmail("");
				setPassword("");
				props.history.push("/");
			})
			.catch((err) => {
				if (err.response.data === "email") {
					toast.error(
						"An account with the email you entered already exists in our database. Please log in using your email and password or create a new account using a different email."
					);
				} else if (err.response.data === "username") {
					toast.error(
						"An account with the username you entered already exists in our database. Please log in using your email and password or create a new account using a different username."
					);
				} else if (err.response.data === "incomplete") {
					toast.error(
						"Please enter at least an email, username and password to continue."
					);
				} else {
					toast.error(
						"A problem was encountered while attempting to create your new account. Please try again later."
					);
				}
			});
	};

	const login = (): void => {
		axios
			.post<User>("/api/auth/login", { userCreds, password: loginPassword })
			.then((res) => {
				const user = res.data;
				setUserCreds("");
				setLoginPassword("");
				dispatch({ type: "UPDATE_USER", payload: user });
				dispatch(getUserGames());
				props.history.push("/");
			})
			.catch((err) => {
				if (err.response.data === "userCreds") {
					toast.error(
						"An account with the email or username you entered does not exist within our database. Please try again or register for an account"
					);
				} else if (err.response.data === "password") {
					toast.error(
						"The password you entered is incorrect, please try again."
					);
				} else if (err.response.data === "incomplete") {
					toast.error(
						"Please enter your email/username and password to continue."
					);
				} else
					toast.error(
						"There was an error while attempting to log you in to your account. Please try again later."
					);
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
							<Button>login</Button>
							<br />
							<Button onClick={toggleLogin}>register</Button>
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
									setPassword(e.target.value)
								}
							/>
							<br></br>
							<Button>register</Button>
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
