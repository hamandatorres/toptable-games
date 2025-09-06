import styled from "@emotion/styled";

const Button = styled.button`
	background: #bebdbd;
	color: #2b2b2b;
	display: relative;
	padding: 8px 5px;
	border: 2px solid #bebdbd;
	border-radius: 2px;
	cursor: pointer;
	transition: 0.5s ease;
	&:focus {
		color: #91360c;
	}
	&:hover {
		color: #91360c;
		background: white;
	}
`;

export default Button;
