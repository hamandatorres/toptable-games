import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
	return (
		<div className="footer">
			<div>
				<h4>TopTable Games</h4>
				<p>
					<a
						href="https://www.linkedin.com/in/carlos-chavez-141926208/"
						rel="noreferrer noopener"
						target="_blank"
					>
						Carlos Chavez
					</a>{" "}
					|{" "}
					<a
						href="https://www.linkedin.com/in/david-j-koser/"
						rel="noreferrer noopener"
						target="_blank"
					>
						David Koser
					</a>{" "}
					|{" "}
					<a
						href="https://www.linkedin.com/in/richard-miller-wimmer/"
						rel="noreferrer noopener"
						target="_blank"
					>
						Richard Miller Wimmer
					</a>
				</p>
			</div>
			<div>
				<Link to="/">
					<div className="footerHexContainer">
						<div className="footerHexagon1"></div>
						<div className="footerHexagon2"></div>
						<div className="footerHexagon3"></div>
					</div>
				</Link>
			</div>
		</div>
	);
};

export default Footer;
