import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Review, ReviewProps } from "customTypes";
import Rating from "../StyledComponents/Rating";

const Reviews: React.FC<ReviewProps> = (props: ReviewProps) => {
	const [review, setReview] = useState([]);
	const game_id = props.game_id;

	const getGameReview = useCallback((): void => {
		axios
			.get(`/api/game/reviews/${game_id}`)
			.then((res) => {
				const reviewsArray = res.data;
				setReview(reviewsArray);
			})
			.catch((err) => console.log(err));
	}, [game_id]);

	useEffect((): void => {
		getGameReview();
	}, [getGameReview]);

	const mappedReviews = review.map((elem: Review, id: number) => {
		if (elem.rating || elem.review) {
			return (
				<article className="reviewContainer" key={id}>
					<Rating rating={elem.rating} />
					<h5 className="usernameHeader">{elem.username}</h5>
					<br />
					<div className="reviewBox">{elem.review}</div>
				</article>
			);
		} else {
			return null;
		}
	});

	return (
		<>
			{mappedReviews[0] ? <h4>Reviews:</h4> : ""}
			{mappedReviews}
		</>
	);
};

export default Reviews;
