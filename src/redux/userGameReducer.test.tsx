import { describe, it, expect } from "vitest";
import userGameReducer, { clearGames } from "./userGameReducer";

describe("userGameReducer", () => {
	it("should return the initial state", () => {
		const initialState = userGameReducer(undefined, { type: "@@INIT" });
		expect(initialState).toEqual({ userGames: [] });
	});

	it("should handle clearGames action", () => {
		const state = {
			userGames: [
				{
					game_id: "test",
					name: "Test",
					play_count: 1,
					rating: 3,
					review: "",
					image_url: "",
					description: "",
					mechanics: [],
					categories: [],
					min_age: 8,
					min_players: 2,
					max_players: 4,
					year_published: 2020,
				},
			],
		};
		const newState = userGameReducer(state, clearGames());
		expect(newState.userGames).toEqual([]);
	});
});
