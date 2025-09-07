import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Button from "../StyledComponents/Button";
import { SearchProps, Option } from "customTypes";

// Advanced search filter interface
export interface SearchFilters {
	searchTerm: string;
	mechanics: string[];
	categories: string[];
	minPlayers: number | null;
	maxPlayers: number | null;
	minAge: number | null;
	maxAge: number | null;
	minYear: number | null;
	maxYear: number | null;
	minRating: number | null;
	maxRating: number | null;
	sortBy: "name" | "rating" | "year" | "players" | "age";
	sortOrder: "asc" | "desc";
	itemsPerPage: number;
	currentPage: number;
}

// Filter presets for quick filtering
const FILTER_PRESETS = {
	family: {
		label: "Family Games",
		filters: { minAge: null, maxAge: 12, minPlayers: 2, maxPlayers: 6 },
	},
	strategy: {
		label: "Strategy Games",
		filters: { categories: ["cat_1"], minAge: 12, minRating: 3.5 },
	},
	party: {
		label: "Party Games",
		filters: { minPlayers: 4, maxPlayers: null, maxAge: null },
	},
	solo: {
		label: "Solo Games",
		filters: { minPlayers: 1, maxPlayers: 1 },
	},
	quick: {
		label: "Quick Games (< 1hr)",
		filters: { maxAge: null }, // Could add game length filter later
	},
};

const AdvancedSearchBar: React.FC<SearchProps> = ({ getAPIGames }) => {
	// State for all search filters
	const [filters, setFilters] = useState<SearchFilters>({
		searchTerm: "",
		mechanics: [],
		categories: [],
		minPlayers: null,
		maxPlayers: null,
		minAge: null,
		maxAge: null,
		minYear: null,
		maxYear: null,
		minRating: null,
		maxRating: null,
		sortBy: "name",
		sortOrder: "asc",
		itemsPerPage: 25,
		currentPage: 0,
	});

	// UI state
	const [expandedSections, setExpandedSections] = useState({
		players: false,
		age: false,
		year: false,
		rating: false,
		sort: false,
	});

	const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);

	// Redux selectors
	const mechanics = useSelector(
		(state: RootState) => state.meccatReducer.mechanic
	);
	const categories = useSelector(
		(state: RootState) => state.meccatReducer.category
	);

	// Sample game names for autocomplete suggestions
	const gameNames = useMemo(
		() => [
			"Root",
			"Scythe",
			"Ticket to Ride",
			"Wingspan",
			"Azul",
			"Splendor",
			"Pandemic",
			"Catan",
			"7 Wonders",
			"Gloomhaven",
			"Spirit Island",
			"Terraforming Mars",
			"Puerto Rico",
			"Power Grid",
			"Agricola",
		],
		[]
	);

	// Update filter function
	const updateFilter = useCallback(
		(key: keyof SearchFilters, value: string | number | string[] | null) => {
			setFilters((prev) => ({
				...prev,
				[key]: value,
				currentPage: key !== "currentPage" ? 0 : prev.currentPage, // Reset page on filter change
			}));
		},
		[]
	);

	// Toggle expanded sections
	const toggleSection = useCallback(
		(section: keyof typeof expandedSections) => {
			setExpandedSections((prev) => ({
				...prev,
				[section]: !prev[section],
			}));
		},
		[]
	);

	// Apply preset filters
	const applyPreset = useCallback((presetKey: keyof typeof FILTER_PRESETS) => {
		const preset = FILTER_PRESETS[presetKey];
		setFilters((prev) => ({
			...prev,
			...preset.filters,
			currentPage: 0,
		}));
	}, []);

	// Search suggestions logic
	const updateSearchSuggestions = useCallback(
		(searchTerm: string) => {
			if (!searchTerm.trim()) {
				setSearchSuggestions([]);
				setShowSuggestions(false);
				return;
			}

			const suggestions = gameNames
				.filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase()))
				.slice(0, 5);

			setSearchSuggestions(suggestions);
			setShowSuggestions(suggestions.length > 0);
		},
		[gameNames]
	);

	// Handle search term changes
	const handleSearchChange = useCallback(
		(value: string) => {
			updateFilter("searchTerm", value);
			updateSearchSuggestions(value);
		},
		[updateFilter, updateSearchSuggestions]
	);

	// Select suggestion
	const selectSuggestion = useCallback(
		(suggestion: string) => {
			updateFilter("searchTerm", suggestion);
			setShowSuggestions(false);
		},
		[updateFilter]
	);

	// Clear all filters
	const clearAllFilters = useCallback(() => {
		setFilters({
			searchTerm: "",
			mechanics: [],
			categories: [],
			minPlayers: null,
			maxPlayers: null,
			minAge: null,
			maxAge: null,
			minYear: null,
			maxYear: null,
			minRating: null,
			maxRating: null,
			sortBy: "name",
			sortOrder: "asc",
			itemsPerPage: 25,
			currentPage: 0,
		});
		setShowSuggestions(false);
	}, []);

	// Execute search with current filters
	const executeSearch = useCallback(() => {
		// For now, use the existing API format until backend is updated
		getAPIGames(
			filters.currentPage,
			filters.searchTerm,
			filters.mechanics,
			filters.categories,
			filters.itemsPerPage.toString()
		);
	}, [getAPIGames, filters]);

	// Debounced search effect
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			executeSearch();
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [executeSearch]);

	// Render mechanics checkboxes
	const renderMechanicsCheckboxes = useMemo(() => {
		return mechanics.map((option: Option) => (
			<div className="checkbox-item" key={`mech-${option.id}`}>
				<input
					type="checkbox"
					id={`mech-${option.id}`}
					checked={filters.mechanics.includes(option.id)}
					onChange={(e) => {
						const newMechanics = e.target.checked
							? [...filters.mechanics, option.id]
							: filters.mechanics.filter((id) => id !== option.id);
						updateFilter("mechanics", newMechanics);
					}}
				/>
				<label htmlFor={`mech-${option.id}`} className="checkbox-label">
					{option.name}
				</label>
			</div>
		));
	}, [mechanics, filters.mechanics, updateFilter]);

	// Render categories checkboxes
	const renderCategoriesCheckboxes = useMemo(() => {
		return categories.map((option: Option) => (
			<div className="checkbox-item" key={`cat-${option.id}`}>
				<input
					type="checkbox"
					id={`cat-${option.id}`}
					checked={filters.categories.includes(option.id)}
					onChange={(e) => {
						const newCategories = e.target.checked
							? [...filters.categories, option.id]
							: filters.categories.filter((id) => id !== option.id);
						updateFilter("categories", newCategories);
					}}
				/>
				<label htmlFor={`cat-${option.id}`} className="checkbox-label">
					{option.name}
				</label>
			</div>
		));
	}, [categories, filters.categories, updateFilter]);

	return (
		<aside className="advanced-search-container">
			{/* Search Input with Autocomplete */}
			<div className="search-input-section">
				<label htmlFor="advanced-search-input" className="search-label">
					Search Games
				</label>
				<div className="search-input-wrapper">
					<input
						id="advanced-search-input"
						type="text"
						value={filters.searchTerm}
						onChange={(e) => handleSearchChange(e.target.value)}
						placeholder="Search by game name..."
						className="search-input"
						onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
						onFocus={() => updateSearchSuggestions(filters.searchTerm)}
					/>
					{showSuggestions && (
						<ul className="search-suggestions">
							{searchSuggestions.map((suggestion, index) => (
								<li
									key={index}
									className="search-suggestion"
									onClick={() => selectSuggestion(suggestion)}
								>
									{suggestion}
								</li>
							))}
						</ul>
					)}
				</div>
			</div>

			{/* Filter Presets */}
			<div className="filter-presets">
				<h3>Quick Filters</h3>
				<div className="preset-buttons">
					{Object.entries(FILTER_PRESETS).map(([key, preset]) => (
						<Button
							key={key}
							onClick={() => applyPreset(key as keyof typeof FILTER_PRESETS)}
							className="preset-button"
							size="small"
						>
							{preset.label}
						</Button>
					))}
				</div>
			</div>

			{/* Player Count Filter */}
			<div className="filter-section">
				<button
					className="section-toggle"
					onClick={() => toggleSection("players")}
					aria-expanded={expandedSections.players}
				>
					<span>Player Count</span>
					<span className="toggle-icon">
						{expandedSections.players ? "−" : "+"}
					</span>
				</button>
				{expandedSections.players && (
					<div className="filter-content">
						<div className="range-inputs">
							<div className="range-input-group">
								<label htmlFor="min-players">Min Players</label>
								<input
									id="min-players"
									type="number"
									min="1"
									max="20"
									value={filters.minPlayers || ""}
									onChange={(e) =>
										updateFilter(
											"minPlayers",
											e.target.value ? parseInt(e.target.value) : null
										)
									}
									placeholder="1"
								/>
							</div>
							<div className="range-input-group">
								<label htmlFor="max-players">Max Players</label>
								<input
									id="max-players"
									type="number"
									min="1"
									max="20"
									value={filters.maxPlayers || ""}
									onChange={(e) =>
										updateFilter(
											"maxPlayers",
											e.target.value ? parseInt(e.target.value) : null
										)
									}
									placeholder="20"
								/>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Age Range Filter */}
			<div className="filter-section">
				<button
					className="section-toggle"
					onClick={() => toggleSection("age")}
					aria-expanded={expandedSections.age}
				>
					<span>Age Range</span>
					<span className="toggle-icon">
						{expandedSections.age ? "−" : "+"}
					</span>
				</button>
				{expandedSections.age && (
					<div className="filter-content">
						<div className="range-inputs">
							<div className="range-input-group">
								<label htmlFor="min-age">Min Age</label>
								<input
									id="min-age"
									type="number"
									min="3"
									max="18"
									value={filters.minAge || ""}
									onChange={(e) =>
										updateFilter(
											"minAge",
											e.target.value ? parseInt(e.target.value) : null
										)
									}
									placeholder="3"
								/>
							</div>
							<div className="range-input-group">
								<label htmlFor="max-age">Max Age</label>
								<input
									id="max-age"
									type="number"
									min="3"
									max="18"
									value={filters.maxAge || ""}
									onChange={(e) =>
										updateFilter(
											"maxAge",
											e.target.value ? parseInt(e.target.value) : null
										)
									}
									placeholder="18+"
								/>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Year Published Filter */}
			<div className="filter-section">
				<button
					className="section-toggle"
					onClick={() => toggleSection("year")}
					aria-expanded={expandedSections.year}
				>
					<span>Year Published</span>
					<span className="toggle-icon">
						{expandedSections.year ? "−" : "+"}
					</span>
				</button>
				{expandedSections.year && (
					<div className="filter-content">
						<div className="range-inputs">
							<div className="range-input-group">
								<label htmlFor="min-year">From</label>
								<input
									id="min-year"
									type="number"
									min="1960"
									max="2025"
									value={filters.minYear || ""}
									onChange={(e) =>
										updateFilter(
											"minYear",
											e.target.value ? parseInt(e.target.value) : null
										)
									}
									placeholder="1960"
								/>
							</div>
							<div className="range-input-group">
								<label htmlFor="max-year">To</label>
								<input
									id="max-year"
									type="number"
									min="1960"
									max="2025"
									value={filters.maxYear || ""}
									onChange={(e) =>
										updateFilter(
											"maxYear",
											e.target.value ? parseInt(e.target.value) : null
										)
									}
									placeholder="2025"
								/>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Rating Filter */}
			<div className="filter-section">
				<button
					className="section-toggle"
					onClick={() => toggleSection("rating")}
					aria-expanded={expandedSections.rating}
				>
					<span>Rating Range</span>
					<span className="toggle-icon">
						{expandedSections.rating ? "−" : "+"}
					</span>
				</button>
				{expandedSections.rating && (
					<div className="filter-content">
						<div className="range-inputs">
							<div className="range-input-group">
								<label htmlFor="min-rating">Min Rating</label>
								<input
									id="min-rating"
									type="number"
									min="1"
									max="5"
									step="0.1"
									value={filters.minRating || ""}
									onChange={(e) =>
										updateFilter(
											"minRating",
											e.target.value ? parseFloat(e.target.value) : null
										)
									}
									placeholder="1.0"
								/>
							</div>
							<div className="range-input-group">
								<label htmlFor="max-rating">Max Rating</label>
								<input
									id="max-rating"
									type="number"
									min="1"
									max="5"
									step="0.1"
									value={filters.maxRating || ""}
									onChange={(e) =>
										updateFilter(
											"maxRating",
											e.target.value ? parseFloat(e.target.value) : null
										)
									}
									placeholder="5.0"
								/>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Sorting Options */}
			<div className="filter-section">
				<button
					className="section-toggle"
					onClick={() => toggleSection("sort")}
					aria-expanded={expandedSections.sort}
				>
					<span>Sort Options</span>
					<span className="toggle-icon">
						{expandedSections.sort ? "−" : "+"}
					</span>
				</button>
				{expandedSections.sort && (
					<div className="filter-content">
						<div className="sort-controls">
							<div className="sort-control-group">
								<label htmlFor="sort-by">Sort By</label>
								<select
									id="sort-by"
									value={filters.sortBy}
									onChange={(e) => updateFilter("sortBy", e.target.value)}
								>
									<option value="name">Name</option>
									<option value="rating">Rating</option>
									<option value="year">Year Published</option>
									<option value="players">Player Count</option>
									<option value="age">Min Age</option>
								</select>
							</div>
							<div className="sort-control-group">
								<label htmlFor="sort-order">Order</label>
								<select
									id="sort-order"
									value={filters.sortOrder}
									onChange={(e) => updateFilter("sortOrder", e.target.value)}
								>
									<option value="asc">Ascending</option>
									<option value="desc">Descending</option>
								</select>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Mechanics Filter */}
			<div className="filter-section">
				<h3>Mechanics</h3>
				<div className="checkbox-grid">{renderMechanicsCheckboxes}</div>
			</div>

			{/* Categories Filter */}
			<div className="filter-section">
				<h3>Categories</h3>
				<div className="checkbox-grid">{renderCategoriesCheckboxes}</div>
			</div>

			{/* Items Per Page */}
			<div className="filter-section">
				<label htmlFor="items-per-page">Items per page</label>
				<select
					id="items-per-page"
					value={filters.itemsPerPage}
					onChange={(e) =>
						updateFilter("itemsPerPage", parseInt(e.target.value))
					}
				>
					<option value={10}>10</option>
					<option value={25}>25</option>
					<option value={50}>50</option>
					<option value={75}>75</option>
					<option value={100}>100</option>
				</select>
			</div>

			{/* Action Buttons */}
			<div className="search-actions">
				<Button onClick={executeSearch} className="search-button">
					Search
				</Button>
				<Button
					onClick={clearAllFilters}
					className="clear-button"
					variant="secondary"
				>
					Clear All
				</Button>
			</div>

			{/* Pagination */}
			<div className="pagination-controls">
				<Button
					onClick={() =>
						updateFilter("currentPage", Math.max(0, filters.currentPage - 1))
					}
					disabled={filters.currentPage === 0}
					size="small"
				>
					Previous
				</Button>
				<span className="page-indicator">Page {filters.currentPage + 1}</span>
				<Button
					onClick={() => updateFilter("currentPage", filters.currentPage + 1)}
					size="small"
				>
					Next
				</Button>
			</div>
		</aside>
	);
};

export default AdvancedSearchBar;
