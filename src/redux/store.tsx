import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userReducer";
import userGameReducer from "./userGameReducer";
import meccatReducer from "./meccatReducer";

export const store = configureStore({
	reducer: {
		userReducer,
		userGameReducer,
		meccatReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
