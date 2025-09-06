import React from "react";

interface SkipLinkProps {
	href: string;
	children: React.ReactNode;
}

const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
	return (
		<a href={href} className="skip-link">
			{children}
		</a>
	);
};

export default SkipLink;
