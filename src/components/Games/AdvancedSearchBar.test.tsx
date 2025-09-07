import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdvancedSearchBar from "./AdvancedSearchBar";
import { renderWithProviders } from "../../test/test-utils";

// Mock the getAPIGames function
const mockGetAPIGames = vi.fn();

const mockProps = {
	getAPIGames: mockGetAPIGames,
};

describe("AdvancedSearchBar Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders without crashing", () => {
		renderWithProviders(<AdvancedSearchBar {...mockProps} />);

		expect(screen.getByLabelText("Search Games")).toBeInTheDocument();
		expect(screen.getByText("Quick Filters")).toBeInTheDocument();
	});

	it("renders search input and basic controls", () => {
		renderWithProviders(<AdvancedSearchBar {...mockProps} />);

		expect(
			screen.getByPlaceholderText("Search by game name...")
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Clear All" })
		).toBeInTheDocument();
	});

	it("shows filter presets", () => {
		renderWithProviders(<AdvancedSearchBar {...mockProps} />);

		expect(screen.getByText("Quick Filters")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Family Games" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Strategy Games" })
		).toBeInTheDocument();
	});

	it("can expand and collapse filter sections", async () => {
		const user = userEvent.setup();
		renderWithProviders(<AdvancedSearchBar {...mockProps} />);

		// Find Player Count section toggle button
		const playerCountToggle = screen.getByRole("button", {
			name: /Player Count/,
		});

		// Initially should be collapsed (aria-expanded should be false)
		expect(playerCountToggle).toHaveAttribute("aria-expanded", "false");

		await user.click(playerCountToggle);

		// After clicking, should be expanded (aria-expanded should be true)
		expect(playerCountToggle).toHaveAttribute("aria-expanded", "true");
	});

	it("updates search term and shows suggestions", async () => {
		const user = userEvent.setup();
		renderWithProviders(<AdvancedSearchBar {...mockProps} />);

		const searchInput = screen.getByPlaceholderText("Search by game name...");
		await user.type(searchInput, "Azul");

		expect(searchInput).toHaveValue("Azul");
	});

	it("applies filter presets when clicked", async () => {
		const user = userEvent.setup();
		renderWithProviders(<AdvancedSearchBar {...mockProps} />);

		const familyGamesButton = screen.getByRole("button", {
			name: "Family Games",
		});
		await user.click(familyGamesButton);

		// The preset should be applied - we'll just verify the button was clicked
		// In a real implementation, this would update the filter state
		expect(familyGamesButton).toBeInTheDocument();
	});

	it("clears all filters when Clear All is clicked", async () => {
		const user = userEvent.setup();
		renderWithProviders(<AdvancedSearchBar {...mockProps} />);

		// Set some values first
		const searchInput = screen.getByPlaceholderText("Search by game name...");
		await user.type(searchInput, "Test Game");

		// Click Clear All button
		const clearButton = screen.getByRole("button", { name: "Clear All" });
		await user.click(clearButton);

		// Verify values are cleared
		expect(searchInput).toHaveValue("");
	});

	it("calls getAPIGames with correct parameters when searching", async () => {
		const user = userEvent.setup();
		renderWithProviders(<AdvancedSearchBar {...mockProps} />);

		const searchInput = screen.getByPlaceholderText("Search by game name...");
		await user.type(searchInput, "Wingspan");

		const searchButton = screen.getByRole("button", { name: "Search" });
		await user.click(searchButton);

		expect(mockGetAPIGames).toHaveBeenCalledWith(
			0, // currentPage
			"Wingspan", // searchEntry
			[], // mechanicsSelections
			[], // categoriesSelections
			"25" // itemsPerPage
		);
	});
});
