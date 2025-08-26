import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import Hero from "../Header/Hero";
import SearchBar from "./SearchBar";
import Leaderboard from "../Header/LeaderBoard";
import VirtualizedGameList from "./VirtualizedGameList";
import { ThumbGame } from "customTypes";
import { RootState } from "../../redux/store";
import { MockGameService } from "../../services/mockGameData";

const GameLibrary: React.FC = () => {
	const [searchResults, setSearchResults] = useState<ThumbGame[]>([]);

	const rating = useSelector((state: RootState) => state.meccatReducer.rating);

	const associateRatings = useCallback(
		(apiGames: ThumbGame[]) => {
			const output = [...apiGames]; // Create a copy to avoid mutation
			output.forEach((game: ThumbGame, ind: number) => {
				const gameRating = rating.find((r) => r.game_id === game.id);
				if (gameRating && output[ind]) {
					output[ind]!.avgRating = gameRating.average_rating;
				}
			});
			setSearchResults(output);
		},
		[rating]
	);

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

	// Calculate container height for virtual scrolling
	// This should be the height of the search results area
	const containerHeight = useMemo(() => {
		// You can adjust this based on your layout
		// It should be the available height for the game list
		return window.innerHeight - 400; // Subtract header, search bar, etc.
	}, []);

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
					<VirtualizedGameList
						games={searchResults}
						containerHeight={containerHeight}
						itemHeight={320} // Estimated height of GameBox component
						overscan={3}
						className="game-library-list"
						emptyMessage={{
							title: "Welcome to TopTable Games!",
							description: "Search for board games using the search bar above.",
							action:
								'Click "Search" with no filters to see all available games.',
						}}
					/>
				</main>
			</div>
		</div>
	);
};

export default GameLibrary;
