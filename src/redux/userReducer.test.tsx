import { describe, it, expect, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import userReducer, { updateUser, logoutUser, type User } from "./userReducer";

type TestStore = ReturnType<typeof configureStore<{ user: User }>>;

describe("userReducer", () => {
	let store: TestStore;

	beforeEach(() => {
		store = configureStore({
			reducer: {
				user: userReducer,
			},
		});
	});

	it("should return the initial state", () => {
		const initialState = userReducer(undefined, { type: "@@INIT" });

		expect(initialState).toEqual({
			user_id: 0,
			first_name: "",
			last_name: "",
			email: "",
			username: "",
		});
	});

	it("should handle updateUser action", () => {
		const newUser: User = {
			user_id: 123,
			first_name: "John",
			last_name: "Doe",
			email: "john.doe@example.com",
			username: "johndoe",
		};

		const action = updateUser(newUser);
		const newState = userReducer(undefined, action);

		expect(newState).toEqual(newUser);
	});

	it("should handle partial updateUser action", () => {
		const initialUser: User = {
			user_id: 123,
			first_name: "John",
			last_name: "Doe",
			email: "john.doe@example.com",
			username: "johndoe",
		};

		// First set the user
		let state = userReducer(undefined, updateUser(initialUser));

		// Then update only some fields
		const partialUpdate = {
			user_id: 123,
			first_name: "Jane",
			last_name: "Smith",
			email: "jane.smith@example.com",
			username: "janesmith",
		};

		state = userReducer(state, updateUser(partialUpdate));

		expect(state).toEqual({
			user_id: 123,
			first_name: "Jane",
			last_name: "Smith",
			email: "jane.smith@example.com",
			username: "janesmith",
		});
	});

	it("should handle logoutUser action", () => {
		const user: User = {
			user_id: 123,
			first_name: "John",
			last_name: "Doe",
			email: "john.doe@example.com",
			username: "johndoe",
		};

		// First set the user
		let state = userReducer(undefined, updateUser(user));
		expect(state.user_id).toBe(123);

		// Then logout
		state = userReducer(state, logoutUser());

		expect(state).toEqual({
			user_id: 0,
			first_name: "",
			last_name: "",
			email: "",
			username: "",
		});
	});

	it("should work with store dispatch", () => {
		const user: User = {
			user_id: 456,
			first_name: "Alice",
			last_name: "Johnson",
			email: "alice@example.com",
			username: "alice",
		};

		store.dispatch(updateUser(user));
		const state = store.getState();

		expect(state.user).toEqual(user);
	});

	it("should handle multiple dispatches correctly", () => {
		const user1: User = {
			user_id: 1,
			first_name: "First",
			last_name: "User",
			email: "first@example.com",
			username: "first",
		};

		const user2: User = {
			user_id: 2,
			first_name: "Second",
			last_name: "User",
			email: "second@example.com",
			username: "second",
		};

		// Dispatch first user
		store.dispatch(updateUser(user1));
		expect(store.getState().user.username).toBe("first");

		// Dispatch second user (should replace first)
		store.dispatch(updateUser(user2));
		expect(store.getState().user.username).toBe("second");

		// Logout
		store.dispatch(logoutUser());
		expect(store.getState().user.user_id).toBe(0);
	});

	it("should preserve type safety", () => {
		// This test ensures TypeScript types are working correctly
		const validUser: User = {
			user_id: 789,
			first_name: "Type",
			last_name: "Safe",
			email: "type@safe.com",
			username: "typesafe",
		};

		const action = updateUser(validUser);

		// Verify action structure
		expect(action.type).toBe("user/updateUser");
		expect(action.payload).toEqual(validUser);
	});
});
