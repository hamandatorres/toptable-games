import React, { useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import Hero from "../Header/Hero";
import SearchBar from "./SearchBar";
import AdvancedSearchBar from "./AdvancedSearchBar";
import Leaderboard from "../Header/LeaderBoard";
import VirtualizedGameList from "./VirtualizedGameList";
import { ThumbGame } from "customTypes";
import { RootState } from "../../redux/store";
import { MockGameService } from "../../services/mockGameData";

const EnhancedGameLibrary: React.FC = () => {
	const [searchResults, setSearchResults] = useState<ThumbGame[]>([]);
	const [useAdvancedSearch, setUseAdvancedSearch] = useState(false);

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

	// Enhanced search function that supports additional filters
	const getEnhancedAPIGames = useCallback(
		async (
			currentPage: number,
			searchEntry: string,
			mechanicsSelections: string[],
			categoriesSelections: string[],
			itemsPerPage: string,
			advancedFilters?: {
				minPlayers?: number | null;
				maxPlayers?: number | null;
				minAge?: number | null;
				maxAge?: number | null;
				minYear?: number | null;
				maxYear?: number | null;
				minRating?: number | null;
				maxRating?: number | null;
				sortBy?: string;
				sortOrder?: "asc" | "desc";
			}
		): Promise<void> => {
			try {
				const skip = Number.parseInt(itemsPerPage) * currentPage;
				const limit = Number.parseInt(itemsPerPage);

				const res = await MockGameService.searchGames(
					searchEntry,
					mechanicsSelections,
					categoriesSelections,
					skip,
					limit,
					advancedFilters
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

	// Standard search function for compatibility
	const getAPIGames = useCallback(
		async (
			currentPage: number,
			searchEntry: string,
			mechanicsSelections: string[],
			categoriesSelections: string[],
			itemsPerPage: string
		): Promise<void> => {
			return getEnhancedAPIGames(
				currentPage,
				searchEntry,
				mechanicsSelections,
				categoriesSelections,
				itemsPerPage
			);
		},
		[getEnhancedAPIGames]
	);

	// Load initial games when component mounts
	React.useEffect(() => {
		getAPIGames(0, "", [], [], "20");
	}, [getAPIGames]);

	// Calculate container height for virtual scrolling
	const containerHeight = useMemo(() => {
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

					{/* Search Mode Toggle */}
					<div style={{ marginBottom: "10px", textAlign: "center" }}>
						<button
							onClick={() => setUseAdvancedSearch(!useAdvancedSearch)}
							style={{
								padding: "8px 16px",
								border: "1px solid #ccc",
								borderRadius: "4px",
								backgroundColor: useAdvancedSearch ? "#007bff" : "#f8f9fa",
								color: useAdvancedSearch ? "white" : "#333",
								cursor: "pointer",
							}}
						>
							{useAdvancedSearch ? "Use Basic Search" : "Use Advanced Search"}
						</button>
					</div>

					{/* Conditional Search Bar Rendering */}
					{useAdvancedSearch ? (
						<AdvancedSearchBar getAPIGames={getAPIGames} />
					) : (
						<SearchBar getAPIGames={getAPIGames} />
					)}
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
							description: useAdvancedSearch
								? "Use the advanced search filters to find your perfect board game."
								: "Search for board games using the search bar above.",
							action:
								'Click "Search" with no filters to see all available games.',
						}}
					/>
				</main>
			</div>
		</div>
	);
};

export default EnhancedGameLibrary;
