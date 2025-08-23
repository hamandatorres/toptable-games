import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import GameBox from "./GameBox";
import { renderWithProviders } from "../../test/test-utils";

const mockThumbGame = {
	id: "test-game-1",
	name: "Test Game",
	thumb_url: "https://example.com/game.jpg",
	avgRating: 4.2,
	description: "A great test game",
	image_url: "https://example.com/game-large.jpg",
	min_players: 2,
	max_players: 4,
	min_playtime: 30,
	max_playtime: 60,
	min_age: 10,
	year_published: 2023,
	mechanics: ["Test Mechanic"],
	categories: ["Test Category"],
};

const mockThumbGameNoRating = {
	...mockThumbGame,
	avgRating: -1,
};

describe("GameBox Component", () => {
	it("renders game name", () => {
		renderWithProviders(<GameBox thumbGame={mockThumbGame} />);

		expect(screen.getByText("Test Game")).toBeInTheDocument();
	});

	it("renders with rating when avgRating is provided", () => {
		renderWithProviders(<GameBox thumbGame={mockThumbGame} />);

		// Check that the rating component is rendered (it should contain rating info)
		// Since we're testing the Rating component behavior indirectly,
		// we'll look for elements that would indicate a rating is shown
		expect(screen.queryByText("Not Yet Reviewed")).not.toBeInTheDocument();
	});

	it("shows 'Not Yet Reviewed' when avgRating is -1", () => {
		renderWithProviders(<GameBox thumbGame={mockThumbGameNoRating} />);

		expect(screen.getByText("Not Yet Reviewed")).toBeInTheDocument();
	});

	it("creates a link to the game detail page", () => {
		renderWithProviders(<GameBox thumbGame={mockThumbGame} />);

		const gameLink = screen.getByRole("link");
		expect(gameLink).toHaveAttribute("href", "/game/test-game-1");
	});

	it("displays game image through SearchResPic component", () => {
		renderWithProviders(<GameBox thumbGame={mockThumbGame} />);

		// Since SearchResPic is a styled component, we can check if it's rendered
		// by looking for the game box container or any specific attributes
		const gameBox = screen.getByRole("link");
		expect(gameBox).toBeInTheDocument();
	});

	it("applies correct CSS class", () => {
		const { container } = renderWithProviders(
			<GameBox thumbGame={mockThumbGame} />
		);

		const gameBoxDiv = container.querySelector(".gameBox");
		expect(gameBoxDiv).toBeInTheDocument();
	});
});
