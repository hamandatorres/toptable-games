import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface User {
	user_id: number;
	first_name: string;
	last_name: string;
	email: string;
	username: string;
}

const initialState: User = {
	user_id: 0,
	first_name: "",
	last_name: "",
	email: "",
	username: "",
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		updateUser: (state, action: PayloadAction<User>) => {
			return { ...state, ...action.payload };
		},
		logoutUser: () => initialState,
	},
});

export const { updateUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
