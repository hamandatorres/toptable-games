import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import type { DBGame, OptionNoName } from "customTypes";
import { MockGameService } from "../services/mockGameData";

export interface UserGame {
	game_id: string;
	name: string;
	play_count: number;
	rating: number;
	review: string;
	image_url: string;
	description: string;
	mechanics: OptionNoName[];
	categories: OptionNoName[];
	min_age: number;
	min_players: number;
	max_players: number;
	year_published: number;
}

export interface GameState {
	userGames: UserGame[];
}

const initialState: GameState = {
	userGames: [],
};

export const fetchUserGames = createAsyncThunk<UserGame[]>(
	"userGames/fetchUserGames",
	async (_, { rejectWithValue }) => {
		try {
			// Get user's games from database
			const dbGames: DBGame[] = await axios
				.get("/api/usergame")
				.then((res) => res.data);

			// Use mock data instead of external API
			const userGames: UserGame[] = await Promise.all(
				dbGames.map(async (dbElem: DBGame) => {
					const mockGame = await MockGameService.getGameById(dbElem.game_id);

					const gameData = mockGame || {
						id: dbElem.game_id,
						name: "Unknown Game",
						thumb_url: "",
						description: "No description available",
						mechanics: [],
						categories: [],
						min_age: 0,
						min_players: 0,
						max_players: 0,
						year_published: 0,
						avgRating: 0,
					};

					return {
						game_id: gameData.id,
						name: gameData.name,
						play_count: dbElem.play_count,
						rating: dbElem.rating,
						review: dbElem.review,
						image_url: gameData.thumb_url,
						description: gameData.description || "No description available",
						mechanics: gameData.mechanics || [],
						categories: gameData.categories || [],
						min_age: gameData.min_age || 0,
						min_players: gameData.min_players || 0,
						max_players: gameData.max_players || 0,
						year_published: gameData.year_published || 0,
					};
				})
			);

			return userGames;
		} catch (err) {
			return rejectWithValue(err);
		}
	}
);

const userGameSlice = createSlice({
	name: "userGame",
	initialState,
	reducers: {
		clearGames: (state) => {
			state.userGames = [];
		},
	},
	extraReducers: (builder) => {
		builder.addCase(
			fetchUserGames.fulfilled,
			(state, action: PayloadAction<UserGame[]>) => {
				state.userGames = action.payload;
			}
		);
	},
});

export const { clearGames } = userGameSlice.actions;
export const getUserGames = fetchUserGames; // Compatibility alias
export default userGameSlice.reducer;
