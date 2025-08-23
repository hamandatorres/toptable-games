import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import Hero from "../Header/Hero";
import SearchBar from "./SearchBar";
import GameBox from "./GameBox";
import Leaderboard from "../Header/LeaderBoard";
import { ThumbGame } from "customTypes";
import { RootState } from "../../redux/store";
import { MockGameService } from "../../services/mockGameData";

const GameLibrary: React.FC = () => {
	const [searchResults, setSearchResults] = useState<ThumbGame[]>([]);
	const [mappedGames, setMappedGames] = useState<React.ReactElement[]>([]);

	const rating = useSelector((state: RootState) => state.meccatReducer.rating);

	// Define callback functions first
	const mapGames = useCallback(() => {
		setMappedGames(
			searchResults.map((elem: ThumbGame, id: number) => {
				return (
					<div key={id}>
						<GameBox thumbGame={elem}></GameBox>
					</div>
				);
			})
		);
	}, [searchResults]);

	const associateRatings = useCallback(
		(apiGames: ThumbGame[]) => {
			const output = [...apiGames]; // Create a copy to avoid mutation
			output.forEach((game: ThumbGame, ind: number) => {
				const gameRating = rating.find((r) => r.game_id === game.id);
				if (gameRating) {
					output[ind].avgRating = gameRating.average_rating;
				}
			});
			setSearchResults(output);
		},
		[rating]
	);

	// useEffect hooks
	useEffect(() => mapGames(), [mapGames]);

	const getAPIGames = useCallback(
		async (
			currentPage: number,
			searchEntry: string,
			mechanicsSelections: string[],
			categoriesSelections: string[],
			itemsPerPage: string
		): Promise<void> => {
			try {
				const skip = Number.parseInt(itemsPerPage) * currentPage;
				const limit = Number.parseInt(itemsPerPage);

				const res = await MockGameService.searchGames(
					searchEntry,
					mechanicsSelections,
					categoriesSelections,
					skip,
					limit
				);

				// Add avgRating property to match ThumbGame interface
				const apiGames: ThumbGame[] = res.games.map((game) => ({
					...game,
					avgRating: game.avgRating || -1,
				}));

				associateRatings(apiGames);
			} catch (err) {
				console.log(err);
			}
		},
		[associateRatings]
	);

	// Load initial games when component mounts
	useEffect(() => {
		getAPIGames(0, "", [], [], "20");
	}, [getAPIGames]);

	return (
		<div id="gameLibrary">
			<Hero />
			<div id="searchResAndForm">
				<div className="flexAside">
					<div className="gameLeaderboard">
						<Leaderboard />
					</div>
					<SearchBar getAPIGames={getAPIGames} />
				</div>
				<main id="searchResults">
					{mappedGames.length > 0 ? (
						mappedGames
					) : (
						<div className="no-results">
							<h2>Welcome to TopTable Games!</h2>
							<p>Search for board games using the search bar above.</p>
							<p>Click "Search" with no filters to see all available games.</p>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};

export default GameLibrary;
