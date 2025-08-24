import { GameBoxProps } from "customTypes";
import React from "react";
import { Link } from "react-router-dom";
import Rating from "../StyledComponents/Rating";
import LazyImage from "../StyledComponents/LazyImage";

// Individual search results - Memoized for performance
const GameBox: React.FC<GameBoxProps> = React.memo((props: GameBoxProps) => {
	const { id, name, thumb_url, avgRating } = props.thumbGame;
	return (
		<div className="gameBox">
			<Link className="gameBox" to={`/game/${id}`}>
				<LazyImage imgUrl={thumb_url} alt={name} />
				<h5>{name}</h5>
				{avgRating === -1 ? (
					<h6>Not Yet Reviewed</h6>
				) : (
					<Rating rating={avgRating} />
				)}
			</Link>
		</div>
	);
});

// Add display name for debugging
GameBox.displayName = "GameBox";

export default GameBox;
