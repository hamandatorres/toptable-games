import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type Rating = {
	game_id: string;
	average_rating: number;
};

export type GameRatings = Rating[];
export interface Mechanic {
	id: string;
	name: string;
	url: string;
}

export interface Category {
	id: string;
	name: string;
	url: string;
}

export interface MecCatState {
	mechanic: Mechanic[];
	category: Category[];
	rating: GameRatings;
}

const initialState: MecCatState = {
	mechanic: [],
	category: [],
	rating: [],
};

const meccatSlice = createSlice({
	name: "meccat",
	initialState,
	reducers: {
		updateMec: (state, action: PayloadAction<Mechanic[]>) => {
			state.mechanic = action.payload;
		},
		updateCat: (state, action: PayloadAction<Category[]>) => {
			state.category = action.payload;
		},
		updateRatings: (state, action: PayloadAction<GameRatings>) => {
			state.rating = action.payload;
		},
	},
});

export const { updateMec, updateCat, updateRatings } = meccatSlice.actions;
export default meccatSlice.reducer;
