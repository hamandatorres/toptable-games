import styled from "@emotion/styled";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "link";
	size?: "small" | "medium" | "large";
	loading?: boolean;
	children: React.ReactNode;
}

const StyledButton = styled.button<ButtonProps>`
	background: ${(props) =>
		props.variant === "primary"
			? "#007bff"
			: props.variant === "secondary"
			? "transparent"
			: "transparent"};
	color: ${(props) =>
		props.variant === "primary"
			? "white"
			: props.variant === "secondary"
			? "#007bff"
			: "#007bff"};
	border: ${(props) =>
		props.variant === "link" ? "none" : "2px solid #007bff"};
	padding: ${(props) =>
		props.size === "small"
			? "0.5rem 1rem"
			: props.size === "large"
			? "1rem 2rem"
			: "0.75rem 1.5rem"};
	font-size: ${(props) =>
		props.size === "small"
			? "0.875rem"
			: props.size === "large"
			? "1.125rem"
			: "1rem"};
	border-radius: 4px;
	cursor: pointer;
	font-weight: 500;
	line-height: 1.5;
	text-align: center;
	text-decoration: ${(props) =>
		props.variant === "link" ? "underline" : "none"};
	transition: all 0.15s ease-in-out;
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	min-width: ${(props) => (props.variant === "link" ? "auto" : "120px")};

	/* Focus indicators for accessibility */
	&:focus-visible {
		outline: 3px solid #005fcc;
		outline-offset: 2px;
	}

	&:focus:not(:focus-visible) {
		outline: none;
	}

	/* Hover states */
	&:hover:not(:disabled) {
		background: ${(props) =>
			props.variant === "primary"
				? "#0056b3"
				: props.variant === "secondary"
				? "#007bff"
				: "transparent"};
		color: ${(props) =>
			props.variant === "primary"
				? "white"
				: props.variant === "secondary"
				? "white"
				: "#0056b3"};
		text-decoration: ${(props) => (props.variant === "link" ? "none" : "none")};
		transform: ${(props) =>
			props.variant === "link" ? "none" : "translateY(-1px)"};
		box-shadow: ${(props) =>
			props.variant === "link" ? "none" : "0 2px 4px rgba(0,0,0,0.1)"};
	}

	/* Active states */
	&:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: none;
	}

	/* Disabled states */
	&:disabled {
		opacity: 0.65;
		cursor: not-allowed;
		pointer-events: none;
		transform: none;
		box-shadow: none;
	}

	/* Loading state */
	&[data-loading="true"] {
		cursor: wait;
		pointer-events: none;

		&::before {
			content: "";
			position: absolute;
			width: 1rem;
			height: 1rem;
			border: 2px solid currentColor;
			border-top-color: transparent;
			border-radius: 50%;
			animation: spin 1s linear infinite;
			margin-right: 0.5rem;
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		border-width: 3px;
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		transition: none;
		animation: none;

		&:hover:not(:disabled) {
			transform: none;
		}
	}
`;

const Button: React.FC<ButtonProps> = ({
	variant = "primary",
	size = "medium",
	loading = false,
	children,
	disabled,
	type = "button",
	...props
}) => {
	return (
		<StyledButton
			variant={variant}
			size={size}
			data-loading={loading}
			disabled={disabled || loading}
			type={type}
			aria-busy={loading}
			{...props}
		>
			{loading && <span className="sr-only">Loading...</span>}
			{children}
		</StyledButton>
	);
};

export default Button;
