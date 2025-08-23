import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userReducer";
import userGameReducer, { clearGames } from "./userGameReducer";
import meccatReducer from "./meccatReducer";

describe("Redux Store Integration", () => {
	it("should initialize all reducers correctly", () => {
		const store = configureStore({
			reducer: {
				user: userReducer,
				userGame: userGameReducer,
				meccat: meccatReducer,
			},
		});

		const state = store.getState();

		// Verify all reducers are present
		expect(state).toHaveProperty("user");
		expect(state).toHaveProperty("userGame");
		expect(state).toHaveProperty("meccat");

		// Verify initial states
		expect(state.userGame.userGames).toEqual([]);
		expect(Array.isArray(state.meccat.mechanic)).toBe(true);
		expect(Array.isArray(state.meccat.category)).toBe(true);
	});

	it("should handle actions from different reducers", () => {
		const store = configureStore({
			reducer: {
				user: userReducer,
				userGame: userGameReducer,
				meccat: meccatReducer,
			},
		});

		// Test userGame action
		store.dispatch(clearGames());
		expect(store.getState().userGame.userGames).toEqual([]);

		// Test user action
		store.dispatch({
			type: "user/updateUser",
			payload: {
				user_id: 1,
				first_name: "Test",
				last_name: "User",
				email: "test@example.com",
				username: "testuser",
			},
		});

		expect(store.getState().user.username).toBe("testuser");
	});
});
