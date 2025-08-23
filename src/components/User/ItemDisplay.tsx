import axios, { AxiosError, AxiosResponse } from "axios";
import React, { useState, useEffect, SyntheticEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { GameDispProps, OptionNoName } from "customTypes";
import Button from "../StyledComponents/Button";
import HTMLReactParser from "html-react-parser";
import mechCatProcessor from "../mechCatProccessor";
import Rating from "../StyledComponents/Rating";
import { getUserGames, UserGame } from "../../redux/userGameReducer";
import { RouteComponentProps } from "react-router-dom";

const ItemDisplay: React.FC<GameDispProps & RouteComponentProps> = (
	props: GameDispProps & RouteComponentProps
): JSX.Element => {
	const [gameID] = useState(props.match.params.id);
	const [yearPublished, setYearPublished] = useState(0);
	const [minPlayers, setMinPlayers] = useState(0);
	const [maxPlayer, setMaxPlayers] = useState(0);
	const [minAge, setMinAge] = useState(0);
	const [mechanicsState, setMechanics] = useState<OptionNoName[]>([]);
	const [categoriesState, setCategories] = useState<OptionNoName[]>([]);
	const [mechanicsProc, setMechanicsProc] = useState("");
	const [categoriesProc, setCategoriesProc] = useState("");
	const [description, setDescription] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [name, setName] = useState("");
	const [playCount, setPlayCount] = useState(0);
	const [rating, setRating] = useState(0);
	const [addEdit, setAddEdit] = useState(false);
	const [review, setReview] = useState("");
	const [editing, setEditing] = useState(false);

	const userGames = useSelector(
		(state: RootState) => state.userGameReducer.userGames
	);
	const mechanicsLib = useSelector(
		(state: RootState) => state.meccatReducer.mechanic
	);
	const categoriesLib = useSelector(
		(state: RootState) => state.meccatReducer.category
	);

	const dispatch = useDispatch();

	useEffect((): void => {
		if (mechanicsLib && categoriesLib) {
			const { mechanicsProcessed, categoriesProcessed } = mechCatProcessor(
				mechanicsState,
				categoriesState,
				mechanicsLib,
				categoriesLib
			);
			setMechanicsProc(mechanicsProcessed);
			setCategoriesProc(categoriesProcessed);
		}
	}, [mechanicsState, categoriesState, mechanicsLib, categoriesLib]);

	useEffect((): void => {
		const userGame: UserGame[] = userGames.filter((el: UserGame) => {
			return el.game_id === gameID ? true : false;
		});
		if (userGame.length === 1) {
			const {
				name,
				play_count,
				rating,
				review,
				image_url,
				description,
				mechanics,
				categories,
				min_age,
				min_players,
				max_players,
				year_published,
			} = userGame[0];

			setYearPublished(year_published);
			setMinPlayers(min_players);
			setMaxPlayers(max_players);
			setMinAge(min_age);
			setMechanics(mechanics);
			setCategories(categories);
			setDescription(description);
			setImageUrl(image_url);
			setName(name);
			setPlayCount(play_count);
			setRating(rating);
			setReview(review ? review : "");
			if (review) {
				setAddEdit(true);
			} else {
				setAddEdit(false);
			}
		}
	}, [userGames, gameID]);

	const increasePlayCount = () => {
		axios
			.put(`/api/usergame/inccount/${gameID}`)
			.then((res) => setPlayCount(res.data.play_count))
			.catch((err) => console.log(err));
	};
	const decreasePlayCount = () => {
		axios
			.put(`/api/usergame/deccount/${gameID}`)
			.then((res) => setPlayCount(res.data.play_count))
			.catch((err) => console.log(err));
	};

	const removeGame = () => {
		axios.delete(`/api/usergame/${gameID}`).then(() => {
			dispatch(getUserGames());
			props.history.push("/user");
		});
	};

	const modRating = (type: string) => {
		switch (type) {
			case "inc":
				return axios
					.put("/api/usergame/rating", { gameID, rating: rating + 1 })
					.then((res: AxiosResponse<{ rating: string }>) => {
						setRating(Number.parseInt(res.data.rating));
					})
					.catch((err: AxiosError) => console.log(err));
			case "dec":
				return axios
					.put("/api/usergame/rating", { gameID, rating: rating - 1 })
					.then((res: AxiosResponse<{ rating: string }>) => {
						setRating(Number.parseInt(res.data.rating));
					})
					.catch((err: AxiosError) => console.log(err));
			default:
				break;
		}
	};
	const postReview = () => {
		axios
			.put(`/api/usergame/review`, { gameID, review })
			.then((res: AxiosResponse<{ review: string }>) => {
				setReview(res.data.review);
			})
			.catch((err) => console.log(err));
	};

	const toggleEditing = (e: SyntheticEvent) => {
		e.preventDefault();
		if (editing) {
			setEditing(false);
			postReview();
		} else {
			setEditing(true);
		}
	};

	return (
		<div className="game-display-page">
			<section className="image-And-Rating">
				<img className="game-images" alt={name} src={imageUrl} />
				<br />
				<section className="playCountContainer">
					<h4>Play Count:</h4>
					<div id="counterBox">
						<Button className="addRemPlay" onClick={() => decreasePlayCount()}>
							-
						</Button>
						<div id="playCtNum">{playCount} </div>
						<Button className="addRemPlay" onClick={() => increasePlayCount()}>
							+
						</Button>
					</div>
				</section>
				<br />
				<div id="ratingReviewContainer">
					<div id="ratingChanger">
						<Button className="addRemRating" onClick={() => modRating("dec")}>
							-
						</Button>
						<Rating rating={rating} />
						<Button className="addRemRating" onClick={() => modRating("inc")}>
							+
						</Button>
					</div>
					<textarea
						className="input"
						role="textbox"
						rows={5}
						id="review"
						value={review}
						onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void =>
							setReview(e.target.value)
						}
						placeholder="write review here"
						name="review"
						disabled={!editing}
					></textarea>
				</div>
				<br />
				<Button onClick={(e) => toggleEditing(e)}>
					{editing ? "submit" : addEdit ? "edit review" : "add review"}
				</Button>

				<br />
				<h2>{name}</h2>
				<section className="game-info-row">
					<h4>players-</h4>
					{` ${minPlayers} to ${maxPlayer}`}
				</section>
				<section className="game-info-row">
					<h4>Minimum Age</h4> -{minAge}
				</section>
				<section className="game-info-container">
					{HTMLReactParser(description)}
				</section>
				<section>
					<h4>Mechanics</h4>
					{mechanicsProc}
				</section>
				<section>
					<h4>Categories</h4>
					{categoriesProc}
				</section>
				<section className="game-info-container">
					<h4>Year Published:</h4> {yearPublished}
				</section>
				<Button className="removeButton" onClick={removeGame}>
					remove game
				</Button>
			</section>
			<form onSubmit={toggleEditing}></form>
			<br />
		</div>
	);
};

export default ItemDisplay;
