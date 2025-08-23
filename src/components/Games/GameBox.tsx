import { GameBoxProps } from "customTypes";
import React from "react";
import { Link } from "react-router-dom";
import Rating from "../StyledComponents/Rating";
import SearchResPic from "../StyledComponents/SearchResPic";

// Individual search results

const GameBox: React.FC<GameBoxProps> = (props: GameBoxProps) => {
	const { id, name, thumb_url, avgRating } = props.thumbGame;
	return (
		<div className="gameBox">
			<Link
				className="gameBox"
				to={{
					pathname: `/game/${id}`,
					state: {
						thumbGame: props.thumbGame,
					},
				}}
			>
				<SearchResPic imgUrl={thumb_url} />
				<h5>{name}</h5>
				{avgRating === -1 ? (
					<h6>Not Yet Reviewed</h6>
				) : (
					<Rating rating={avgRating} />
				)}
			</Link>
		</div>
	);
};

export default GameBox;
