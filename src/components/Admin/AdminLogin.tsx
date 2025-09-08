import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../../redux/store";

interface AdminLoginProps {
	onLogin: (isAdmin: boolean) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();

	// For development, we'll use simple admin credentials
	// In production, this should integrate with your existing auth system
	const ADMIN_CREDENTIALS = {
		username: "admin",
		password: "admin123", // In production, this should be hashed and stored securely
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			// Simulate API call delay
			await new Promise((resolve) => setTimeout(resolve, 500));

			if (
				username === ADMIN_CREDENTIALS.username &&
				password === ADMIN_CREDENTIALS.password
			) {
				// Store admin session
				sessionStorage.setItem("adminAuthenticated", "true");
				sessionStorage.setItem("adminLoginTime", new Date().toISOString());

				onLogin(true);
				navigate("/admin/dashboard");
			} else {
				setError("Invalid admin credentials");
			}
		} catch (err) {
			setError("Login failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="admin-login">
			<div className="admin-login-container">
				<div className="admin-login-header">
					<h1>🏆 TopTable Games</h1>
					<h2>Admin Portal</h2>
					<p>Game Management Interface</p>
				</div>

				<form onSubmit={handleSubmit} className="admin-login-form">
					<div className="form-group">
						<label htmlFor="username">Admin Username</label>
						<input
							type="text"
							id="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="Enter admin username"
							required
							disabled={loading}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="password">Admin Password</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter admin password"
							required
							disabled={loading}
						/>
					</div>

					{error && (
						<div className="error-message">
							<span>⚠️ {error}</span>
						</div>
					)}

					<button
						type="submit"
						className="admin-login-btn"
						disabled={loading || !username || !password}
					>
						{loading ? "Authenticating..." : "Access Admin Panel"}
					</button>
				</form>

				<div className="admin-login-info">
					<h3>Development Credentials</h3>
					<p>
						<strong>Username:</strong> admin
					</p>
					<p>
						<strong>Password:</strong> admin123
					</p>
					<small>⚠️ These are development credentials only</small>
				</div>

				<div className="admin-login-footer">
					<button
						type="button"
						onClick={() => navigate("/")}
						className="back-to-app-btn"
					>
						← Back to Application
					</button>
				</div>
			</div>
		</div>
	);
};

export default AdminLogin;
