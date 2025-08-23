import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import type { DBGame, OptionNoName } from "customTypes";

export interface APIGame {
	id: string;
	name: string;
	image_url: string;
	description: string;
	mechanics: OptionNoName[];
	categories: OptionNoName[];
	min_age: number;
	min_players: number;
	max_players: number;
	year_published: number;
}

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
			const dbGames: DBGame[] = await axios
				.get("/api/usergame")
				.then((res) => res.data);
			const userGameIds = dbGames.map((elem: DBGame) => elem.game_id);
			const apiGames: APIGame[] = await axios
				.get(
					`https://api.boardgameatlas.com/api/search?ids=${userGameIds.join(
						","
					)}&fields=id,name,year_published,min_players,max_players,min_age,mechanics,categories,description,image_url&client_id=${
						import.meta.env.VITE_CLIENT_ID
					}`
				)
				.then((res) => res.data.games);
			const userGames: UserGame[] = dbGames.map((dbElem: DBGame) => {
				const matched: APIGame = apiGames.find(
					(apiElem) => dbElem.game_id === apiElem.id
				) || {
					id: "",
					name: "",
					image_url: "",
					description: "",
					mechanics: [],
					categories: [],
					min_age: 0,
					min_players: 0,
					max_players: 0,
					year_published: 0,
				};
				return {
					game_id: matched.id,
					name: matched.name,
					play_count: dbElem.play_count,
					rating: dbElem.rating,
					review: dbElem.review,
					image_url: matched.image_url,
					description: matched.description,
					mechanics: matched.mechanics,
					categories: matched.categories,
					min_age: matched.min_age,
					min_players: matched.min_players,
					max_players: matched.max_players,
					year_published: matched.year_published,
				};
			});
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
