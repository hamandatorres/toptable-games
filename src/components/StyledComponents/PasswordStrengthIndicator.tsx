import React from "react";

interface PasswordStrengthIndicatorProps {
	score: number;
	feedback: string;
	requirements: {
		length: boolean;
		uppercase: boolean;
		lowercase: boolean;
		number: boolean;
		special: boolean;
	};
	showRequirements?: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
	score,
	feedback,
	requirements,
	showRequirements = true,
}) => {
	const getStrengthColor = (score: number) => {
		if (score <= 1) return "#ff4757"; // Red
		if (score <= 2) return "#ffa502"; // Orange
		if (score <= 3) return "#ffdd59"; // Yellow
		if (score <= 4) return "#2ed573"; // Green
		return "#1e90ff"; // Blue
	};

	const getStrengthWidth = (score: number) => {
		return `${(score / 5) * 100}%`;
	};

	return (
		<div className="password-strength">
			<div className="password-strength__bar">
				<div
					className="password-strength__fill"
					style={{
						width: getStrengthWidth(score),
						backgroundColor: getStrengthColor(score),
						height: "4px",
						borderRadius: "2px",
						transition: "all 0.3s ease",
					}}
				/>
			</div>

			<div className="password-strength__feedback">
				<span style={{ color: getStrengthColor(score), fontSize: "0.8rem" }}>
					{feedback}
				</span>
			</div>

			{showRequirements && (
				<div className="password-requirements">
					<div className="password-requirements__title">
						Password Requirements:
					</div>
					<ul className="password-requirements__list">
						<li
							className={requirements.length ? "valid" : "invalid"}
							style={{ color: requirements.length ? "#2ed573" : "#ff4757" }}
						>
							✓ At least 8 characters
						</li>
						<li
							className={requirements.uppercase ? "valid" : "invalid"}
							style={{ color: requirements.uppercase ? "#2ed573" : "#ff4757" }}
						>
							✓ One uppercase letter
						</li>
						<li
							className={requirements.lowercase ? "valid" : "invalid"}
							style={{ color: requirements.lowercase ? "#2ed573" : "#ff4757" }}
						>
							✓ One lowercase letter
						</li>
						<li
							className={requirements.number ? "valid" : "invalid"}
							style={{ color: requirements.number ? "#2ed573" : "#ff4757" }}
						>
							✓ One number
						</li>
						<li
							className={requirements.special ? "valid" : "invalid"}
							style={{ color: requirements.special ? "#2ed573" : "#ff4757" }}
						>
							✓ One special character (!@#$%^&*(),.?":{}|{`<>`})
						</li>
					</ul>
				</div>
			)}
		</div>
	);
};

export default PasswordStrengthIndicator;
