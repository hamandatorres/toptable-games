import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Hero from "../Header/Hero";
import SearchBar from "./SearchBar";
import GameBox from "./GameBox";
import Leaderboard from "../Header/LeaderBoard";
import { ThumbGame } from "customTypes";
import { RootState } from "../../redux/store";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

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

	const getAPIGames = async (
		currentPage: number,
		searchEntry: string,
		mechanicsSelections: string[],
		categoriesSelections: string[],
		itemsPerPage: string
	): Promise<void> => {
		const skip = Number.parseInt(itemsPerPage) * currentPage;
		//prettier-ignore
		await axios.get(`https://api.boardgameatlas.com/api/search?fuzzy_match=true${searchEntry ? `&name=${encodeURI(searchEntry)}` : ''}${mechanicsSelections.length !== 0 ? `&mechanics=${mechanicsSelections.join(',')}` : ''}${categoriesSelections.length !== 0 ? `&categories=${categoriesSelections.join(',')}` : ''}${skip !== 0 ? `&skip=${skip.toString()}` : ''}&limit=${itemsPerPage}&fields=id,name,thumb_url&client_id=${CLIENT_ID}`)
    // 
    .then((res) => {
      res.data.games.forEach(
        (
          el: { id: string; name: string; thumb_url: string },
          ind: number,
          array: { id: string; name: string; thumb_url: string }[]
        ) => (array[ind] = { ...el, ...{ avgRating: -1 } })
      );
      const apiGames: ThumbGame[] = res.data.games;
      associateRatings(apiGames)
    });
	};

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
						<div style={{ padding: "20px", textAlign: "center" }}>
							<h2>Welcome to TopTable Games!</h2>
							<p>
								To see board games, please add your Board Game Atlas API key to
								the .env file (VITE_CLIENT_ID)
							</p>
							<p>
								You can get a free API key at:{" "}
								<a
									href="https://www.boardgameatlas.com/api/docs"
									target="_blank"
									rel="noopener noreferrer"
								>
									Board Game Atlas API
								</a>
							</p>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};

export default GameLibrary;
