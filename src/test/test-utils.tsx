import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../redux/userReducer";
import userGameReducer from "../redux/userGameReducer";
import meccatReducer from "../redux/meccatReducer";

// Import your store's RootState type
export interface RootState {
	userReducer: ReturnType<typeof userReducer>;
	userGameReducer: ReturnType<typeof userGameReducer>;
	meccatReducer: ReturnType<typeof meccatReducer>;
}

interface ExtendedRenderOptions extends Omit<RenderOptions, "wrapper"> {
	preloadedState?: Partial<RootState>;
	store?: ReturnType<typeof setupStore>;
}

export function setupStore(preloadedState?: Partial<RootState>) {
	return configureStore({
		reducer: {
			userReducer,
			userGameReducer,
			meccatReducer,
		},
		preloadedState,
	});
}

export function renderWithProviders(
	ui: ReactElement,
	{
		preloadedState = {},
		store = setupStore(preloadedState),
		...renderOptions
	}: ExtendedRenderOptions = {}
) {
	function Wrapper({ children }: { children?: React.ReactNode }) {
		return (
			<Provider store={store}>
				<BrowserRouter
					future={{
						v7_startTransition: true,
						v7_relativeSplatPath: true,
					}}
				>
					{children}
				</BrowserRouter>
			</Provider>
		);
	}

	return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Mock data helpers
export const mockUser = {
	user_id: 1,
	username: "testuser",
	first_name: "Test",
	last_name: "User",
	email: "test@example.com",
};

export const mockGame = {
	id: "OIXt3DmJU0",
	name: "Wingspan",
	description:
		"Wingspan is a competitive, medium-weight, card-driven, engine-building board game from Stonemaier Games.",
	image_url:
		"https://d2k4q26owzy373.cloudfront.net/350x350/games/uploaded/1559254202420-51CaXxKsXmL.jpg",
	min_players: 1,
	max_players: 5,
	min_playtime: 40,
	max_playtime: 70,
	min_age: 10,
	year_published: 2019,
	mechanics: ["Engine Building", "Card Drafting"],
	categories: ["Animals", "Strategy"],
	average_user_rating: 4.2,
	num_user_ratings: 150,
};

export const mockUserGame = {
	game_id: "OIXt3DmJU0",
	user_id: 1,
	play_count: 5,
	rating: 4,
	review: "Great game! Love the bird theme.",
	date_added: "2024-01-15",
	...mockGame,
};

// Mock API responses
export const mockApiResponses = {
	games: [mockGame],
	userGames: [mockUserGame],
	searchResults: [mockGame],
};
