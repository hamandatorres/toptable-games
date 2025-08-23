import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { logoutUser } from "../../redux/userReducer";

const Header: React.FC = () => {
	const user_id = useSelector((state: RootState) => state.userReducer.user_id);
	const navigate = useNavigate();

	const [checkBox, setCheckBox] = useState(false);

	const dispatch = useDispatch();

	const handleLogout = (): void => {
		axios
			.delete("/api/auth/logout")
			.then(() => {
				navigate("/");
				dispatch(logoutUser());
			})
			.catch((err) => console.log(err));
	};

	const toggleCheckBox = (): void => {
		setCheckBox(!checkBox);
	};

	return (
		<div className="header">
			<div>
				<Link to="/" aria-label="go to home page">
					<div className="header__hex-container">
						<div className="header__hex-container__hexagon1"></div>
						<div className="header__hex-container__hexagon2"></div>
						<div className="header__hex-container__hexagon3"></div>
					</div>
				</Link>
			</div>

			<nav id="header__nav-container">
				<div id="header__menu__toggle">
					<input
						type="checkbox"
						id="checkbox"
						checked={checkBox}
						onChange={toggleCheckBox}
						aria-label="Toggle navigation menu"
					/>

					<span></span>
					<span></span>
					<span></span>

					<ul id="header__menu">
						<li>
							<Link
								onClick={toggleCheckBox}
								className="header__menu__nav-link"
								to="/"
							>
								home
							</Link>
						</li>
						{user_id ? (
							<li>
								<Link
									onClick={toggleCheckBox}
									className="header__menu__nav-link"
									to="/user"
								>
									profile
								</Link>
							</li>
						) : (
							""
						)}
						{user_id ? (
							<li>
								<Link
									onClick={toggleCheckBox}
									className="header__menu__nav-link"
									to="/account"
								>
									account
								</Link>
							</li>
						) : (
							""
						)}
						{user_id ? (
							<li>
								<a
									onClick={() => {
										handleLogout();
										toggleCheckBox();
									}}
								>
									logout
								</a>
							</li>
						) : (
							<li>
								<Link
									onClick={toggleCheckBox}
									className="header__menu__nav-link"
									to="/auth"
								>
									login
								</Link>
							</li>
						)}
					</ul>
				</div>
			</nav>
		</div>
	);
};

export default Header;
