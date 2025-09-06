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

	const getStrengthLabel = (score: number) => {
		if (score <= 1) return "Very Weak";
		if (score <= 2) return "Weak";
		if (score <= 3) return "Fair";
		if (score <= 4) return "Good";
		return "Strong";
	};

	return (
		<div
			className="password-strength"
			role="group"
			aria-labelledby="password-strength-label"
		>
			<div id="password-strength-label" className="sr-only">
				Password strength indicator and requirements
			</div>

			<div
				className="password-strength__bar"
				role="progressbar"
				aria-valuenow={score}
				aria-valuemin={0}
				aria-valuemax={5}
				aria-label={`Password strength: ${getStrengthLabel(
					score
				)} (${score} out of 5)`}
			>
				<div
					className="password-strength__fill"
					style={{
						width: getStrengthWidth(score),
						backgroundColor: getStrengthColor(score),
						height: "4px",
						borderRadius: "2px",
						transition: "all 0.3s ease",
					}}
					aria-hidden="true"
				/>
			</div>

			<div
				className="password-strength__feedback"
				aria-live="polite"
				aria-atomic="true"
			>
				<span
					style={{ color: getStrengthColor(score), fontSize: "0.8rem" }}
					aria-label={`Password strength level: ${feedback}`}
				>
					{feedback}
				</span>
			</div>

			{showRequirements && (
				<div
					className="password-requirements"
					role="group"
					aria-labelledby="requirements-heading"
				>
					<div
						id="requirements-heading"
						className="password-requirements__title"
					>
						Password Requirements:
					</div>
					<ul className="password-requirements__list" role="list">
						<li
							className={requirements.length ? "valid" : "invalid"}
							style={{ color: requirements.length ? "#2ed573" : "#ff4757" }}
							role="listitem"
							aria-describedby="req-length"
						>
							<span aria-hidden="true">{requirements.length ? "✓" : "✗"}</span>
							<span id="req-length">At least 8 characters</span>
							<span className="sr-only">
								{requirements.length
									? "Requirement met"
									: "Requirement not met"}
							</span>
						</li>
						<li
							className={requirements.uppercase ? "valid" : "invalid"}
							style={{ color: requirements.uppercase ? "#2ed573" : "#ff4757" }}
							role="listitem"
							aria-describedby="req-uppercase"
						>
							<span aria-hidden="true">
								{requirements.uppercase ? "✓" : "✗"}
							</span>
							<span id="req-uppercase">One uppercase letter</span>
							<span className="sr-only">
								{requirements.uppercase
									? "Requirement met"
									: "Requirement not met"}
							</span>
						</li>
						<li
							className={requirements.lowercase ? "valid" : "invalid"}
							style={{ color: requirements.lowercase ? "#2ed573" : "#ff4757" }}
							role="listitem"
							aria-describedby="req-lowercase"
						>
							<span aria-hidden="true">
								{requirements.lowercase ? "✓" : "✗"}
							</span>
							<span id="req-lowercase">One lowercase letter</span>
							<span className="sr-only">
								{requirements.lowercase
									? "Requirement met"
									: "Requirement not met"}
							</span>
						</li>
						<li
							className={requirements.number ? "valid" : "invalid"}
							style={{ color: requirements.number ? "#2ed573" : "#ff4757" }}
							role="listitem"
							aria-describedby="req-number"
						>
							<span aria-hidden="true">{requirements.number ? "✓" : "✗"}</span>
							<span id="req-number">One number</span>
							<span className="sr-only">
								{requirements.number
									? "Requirement met"
									: "Requirement not met"}
							</span>
						</li>
						<li
							className={requirements.special ? "valid" : "invalid"}
							style={{ color: requirements.special ? "#2ed573" : "#ff4757" }}
							role="listitem"
							aria-describedby="req-special"
						>
							<span aria-hidden="true">{requirements.special ? "✓" : "✗"}</span>
							<span id="req-special">
								One special character (!@#$%^&*(),.?":{}|{`<>`})
							</span>
							<span className="sr-only">
								{requirements.special
									? "Requirement met"
									: "Requirement not met"}
							</span>
						</li>
					</ul>
				</div>
			)}
		</div>
	);
};

export default PasswordStrengthIndicator;
