import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState, AppDispatch } from "../../redux/store";
import XSSProtection from "../../utils/xssProtection";
import Reviews from "./Reviews";
import Rating from "../StyledComponents/Rating";
import Button from "../StyledComponents/Button";
import { UserGame, getUserGames } from "../../redux/userGameReducer";
import mechCatProcessor from "../mechCatProccessor";
import { GameRatings } from "../../redux/meccatReducer";
import { MockGameService } from "../../services/mockGameData";

const GameDisplay: React.FC = () => {
	const [nameState, setName] = useState("");
	const [yearPublishedState, setYearPublisehd] = useState("");
	const [minPlayersState, setMinPlayers] = useState("");
	const [maxPlayersState, setMaxPlayers] = useState("");
	const [minAgeState, setMinAge] = useState("");
	const [mechanicsState, setMechanics] = useState("");
	const [categoriesState, setCategories] = useState("");
	const [descriptionState, setDescription] = useState("");
	const [imageUrlState, setImageUrl] = useState("");
	const [inList, setInList] = useState(false);
	const [thisRating, setThisRating] = useState(0);

	const { id } = useParams<{ id: string }>();
	const email = useSelector((state: RootState) => state.userReducer.email);
	const userGames = useSelector(
		(state: RootState) => state.userGameReducer.userGames
	);

	const mechanicsLib = useSelector(
		(state: RootState) => state.meccatReducer.mechanic
	);
	const categoriesLib = useSelector(
		(state: RootState) => state.meccatReducer.category
	);

	const gameRatings: GameRatings = useSelector(
		(state: RootState) => state.meccatReducer.rating
	);

	const dispatch = useDispatch<AppDispatch>();

	// Define callback functions before useEffect calls
	const getGameDetails = useCallback(async (): Promise<void> => {
		if (!id) return;

		try {
			const game = await MockGameService.getGameById(id);

			if (game) {
				setName(game.name);
				setYearPublisehd(game.year_published?.toString() || "");
				setMinPlayers(game.min_players?.toString() || "");
				setMaxPlayers(game.max_players?.toString() || "");
				setMinAge(game.min_age?.toString() || "");
				setImageUrl(game.thumb_url);
				setDescription(game.description || "No description available.");

				const { mechanicsProcessed, categoriesProcessed } = mechCatProcessor(
					game.mechanics || [],
					game.categories || [],
					mechanicsLib,
					categoriesLib
				);

				setMechanics(mechanicsProcessed);
				setCategories(categoriesProcessed);
			}
		} catch (error) {
			console.error("Error fetching game details:", error);
		}
	}, [id, mechanicsLib, categoriesLib]);

	const setRating = useCallback(() => {
		let ratingFiltered = 0;
		gameRatings.forEach(
			(el) => (
				el.game_id === id ? (ratingFiltered = el.average_rating) : -1, -1
			)
		);
		setThisRating(ratingFiltered);
	}, [gameRatings, id]);

	const determineGameAdded = useCallback(() => {
		const found = userGames.reduce(
			(accum: number, el: UserGame) => (el.game_id === id ? ++accum : accum),
			0
		);
		if (found) {
			setInList(true);
		}
	}, [userGames, id]);

	// useEffect hooks
	useEffect((): void => {
		getGameDetails();
	}, [getGameDetails]);

	useEffect(() => {
		setRating();
	}, [setRating]);

	useEffect((): void => {
		determineGameAdded();
	}, [determineGameAdded]);

	const addRemoveGame = async (addRemove: string): Promise<void> => {
		switch (addRemove) {
			case "remove":
				return await axios.delete(`/api/usergame/${id}`).then(() => {
					setInList(false);
					dispatch(getUserGames());
				});
			case "add":
				return await axios.post(`/api/usergame/${id}`).then(() => {
					setInList(true);
					dispatch(getUserGames());
				});
			default:
				break;
		}
	};

	return (
		<div className="game-display-page">
			<main className="pic-And-Game-Info">
				<div className="image-And-Rating">
					<img src={imageUrlState} className="game-images" alt={nameState} />
					{thisRating === -1 ? (
						<h5>Not Yet Reviewed</h5>
					) : (
						<Rating rating={thisRating} />
					)}
					<br />

					{inList ? (
						<p className="alreadyGame">
							this game is already in your collection
						</p>
					) : (
						""
					)}
					<Button
						onClick={() => addRemoveGame(inList ? "remove" : "add")}
						className={email ? "show-inline" : "hide"}
					>
						{inList ? "remove game" : "add game"}
					</Button>
				</div>
				<div className="game-info-container">
					<h2 className="game-name">{nameState}</h2>
					<section className="game-info-row">
						<h4>players-</h4>
						{` ${minPlayersState} to ${maxPlayersState}`}
					</section>
					<section className="game-info-row">
						<h4>minimum age-</h4>
						{` ${minAgeState}`}
					</section>
					<br />
					<section className="game-info-column">
						<h4>categories:</h4>
						<div className="mecCatBox">{categoriesState.toLowerCase()}</div>
					</section>
					<br />
					<section className="game-info-column">
						<h4>mechanics:</h4>
						<div className="mecCatBox">{mechanicsState.toLowerCase()}</div>
					</section>
					<section className="game-info-column">
						<article className="game-description">
							<XSSProtection.SafeHTML html={descriptionState} />
						</article>
					</section>
					<section className="game-info-row">
						<h4>year published-</h4>
						{` ${yearPublishedState}`}
					</section>
				</div>
			</main>
			{id && <Reviews game_id={id} />}
		</div>
	);
};

export default GameDisplay;
