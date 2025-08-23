import { describe, it, expect, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import meccatReducer, {
	updateMec,
	updateCat,
	updateRatings,
	type MecCatState,
	type Mechanic,
	type Category,
	type GameRatings,
} from "./meccatReducer";

type TestStore = ReturnType<typeof configureStore<{ meccat: MecCatState }>>;

describe("meccatReducer", () => {
	let store: TestStore;

	beforeEach(() => {
		store = configureStore({
			reducer: {
				meccat: meccatReducer,
			},
		});
	});

	it("should return the initial state", () => {
		const initialState = meccatReducer(undefined, { type: "@@INIT" });

		expect(initialState).toEqual({
			mechanic: [],
			category: [],
			rating: [],
		});
	});

	it("should handle updateMec action", () => {
		const mechanics: Mechanic[] = [
			{
				id: "mech1",
				name: "Deck Building",
				url: "https://example.com/deck-building",
			},
			{
				id: "mech2",
				name: "Worker Placement",
				url: "https://example.com/worker-placement",
			},
		];

		const action = updateMec(mechanics);
		const newState = meccatReducer(undefined, action);

		expect(newState.mechanic).toEqual(mechanics);
		expect(newState.category).toEqual([]);
		expect(newState.rating).toEqual([]);
	});

	it("should handle updateCat action", () => {
		const categories: Category[] = [
			{
				id: "cat1",
				name: "Strategy",
				url: "https://example.com/strategy",
			},
			{
				id: "cat2",
				name: "Economic",
				url: "https://example.com/economic",
			},
		];

		const action = updateCat(categories);
		const newState = meccatReducer(undefined, action);

		expect(newState.category).toEqual(categories);
		expect(newState.mechanic).toEqual([]);
		expect(newState.rating).toEqual([]);
	});

	it("should handle updateRatings action", () => {
		const ratings: GameRatings = [
			{
				game_id: "game1",
				average_rating: 4.5,
			},
			{
				game_id: "game2",
				average_rating: 3.8,
			},
		];

		const action = updateRatings(ratings);
		const newState = meccatReducer(undefined, action);

		expect(newState.rating).toEqual(ratings);
		expect(newState.mechanic).toEqual([]);
		expect(newState.category).toEqual([]);
	});

	it("should handle multiple updates independently", () => {
		const mechanics: Mechanic[] = [
			{ id: "mech1", name: "Deck Building", url: "url1" },
		];
		const categories: Category[] = [
			{ id: "cat1", name: "Strategy", url: "url2" },
		];
		const ratings: GameRatings = [{ game_id: "game1", average_rating: 4.0 }];

		let state = meccatReducer(undefined, updateMec(mechanics));
		state = meccatReducer(state, updateCat(categories));
		state = meccatReducer(state, updateRatings(ratings));

		expect(state.mechanic).toEqual(mechanics);
		expect(state.category).toEqual(categories);
		expect(state.rating).toEqual(ratings);
	});

	it("should replace existing data on updates", () => {
		const initialMechanics: Mechanic[] = [
			{ id: "mech1", name: "Initial Mechanic", url: "url1" },
		];
		const newMechanics: Mechanic[] = [
			{ id: "mech2", name: "New Mechanic", url: "url2" },
			{ id: "mech3", name: "Another Mechanic", url: "url3" },
		];

		let state = meccatReducer(undefined, updateMec(initialMechanics));
		expect(state.mechanic).toHaveLength(1);

		state = meccatReducer(state, updateMec(newMechanics));
		expect(state.mechanic).toHaveLength(2);
		expect(state.mechanic).toEqual(newMechanics);
	});

	it("should work with store dispatch", () => {
		const mechanics: Mechanic[] = [
			{ id: "test", name: "Test Mechanic", url: "test-url" },
		];

		store.dispatch(updateMec(mechanics));
		const state = store.getState();

		expect(state.meccat.mechanic).toEqual(mechanics);
	});

	it("should handle empty arrays", () => {
		// Start with some data
		const mechanics: Mechanic[] = [
			{ id: "mech1", name: "Mechanic", url: "url" },
		];

		let state = meccatReducer(undefined, updateMec(mechanics));
		expect(state.mechanic).toHaveLength(1);

		// Clear with empty array
		state = meccatReducer(state, updateMec([]));
		expect(state.mechanic).toEqual([]);
	});

	it("should preserve type safety", () => {
		const mechanics: Mechanic[] = [
			{ id: "safe", name: "Type Safe", url: "safe-url" },
		];

		const action = updateMec(mechanics);

		expect(action.type).toBe("meccat/updateMec");
		expect(action.payload).toEqual(mechanics);
	});
});
