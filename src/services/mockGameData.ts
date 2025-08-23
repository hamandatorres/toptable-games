// Mock data service to replace Board Game Atlas API
import { ThumbGame } from "customTypes";

export interface MockGame extends ThumbGame {
	description?: string;
	year_published?: number;
	min_players?: number;
	max_players?: number;
	min_age?: number;
	mechanics?: Array<{ id: string; name: string; url: string }>;
	categories?: Array<{ id: string; name: string; url: string }>;
}

// Sample board games data
export const mockGamesDatabase: MockGame[] = [
	{
		id: "TAAifFP590",
		name: "Root",
		thumb_url:
			"https://d2k4q26owzy373.cloudfront.net/350x350/games/uploaded/1540147295104",
		avgRating: 4.2,
		description:
			"Root is a game of adventure and war in which 2 to 4 players battle for control of a vast wilderness.",
		year_published: 2018,
		min_players: 2,
		max_players: 4,
		min_age: 13,
		mechanics: [
			{ id: "mech_1", name: "Area Control", url: "" },
			{ id: "mech_2", name: "Variable Player Powers", url: "" },
		],
		categories: [
			{ id: "cat_1", name: "Strategy", url: "" },
			{ id: "cat_2", name: "War", url: "" },
		],
	},
	{
		id: "yqR4PtpO8X",
		name: "Scythe",
		thumb_url:
			"https://d2k4q26owzy373.cloudfront.net/350x350/games/uploaded/1562865327667",
		avgRating: 4.3,
		description:
			"Scythe is an engine-building, asymmetric, competitive board game set in an alternate-history 1920s period.",
		year_published: 2016,
		min_players: 1,
		max_players: 5,
		min_age: 14,
		mechanics: [
			{ id: "mech_3", name: "Engine Building", url: "" },
			{ id: "mech_2", name: "Variable Player Powers", url: "" },
		],
		categories: [
			{ id: "cat_1", name: "Strategy", url: "" },
			{ id: "cat_3", name: "Economic", url: "" },
		],
	},
	{
		id: "AuBvbISHR6",
		name: "Ticket to Ride",
		thumb_url:
			"https://d2k4q26owzy373.cloudfront.net/350x350/games/uploaded/1559254202421",
		avgRating: 3.9,
		description:
			"Ticket to Ride is a railway-themed German-style board game designed by Alan R. Moon.",
		year_published: 2004,
		min_players: 2,
		max_players: 5,
		min_age: 8,
		mechanics: [
			{ id: "mech_4", name: "Set Collection", url: "" },
			{ id: "mech_5", name: "Route Building", url: "" },
		],
		categories: [
			{ id: "cat_4", name: "Family", url: "" },
			{ id: "cat_5", name: "Trains", url: "" },
		],
	},
	{
		id: "fDn9rQjH9O",
		name: "Wingspan",
		thumb_url:
			"https://d2k4q26owzy373.cloudfront.net/350x350/games/uploaded/1558372553698",
		avgRating: 4.1,
		description:
			"Wingspan is a competitive, medium-weight, card-driven, engine-building board game from Stonemaier Games.",
		year_published: 2019,
		min_players: 1,
		max_players: 5,
		min_age: 10,
		mechanics: [
			{ id: "mech_3", name: "Engine Building", url: "" },
			{ id: "mech_6", name: "Card Drafting", url: "" },
		],
		categories: [
			{ id: "cat_6", name: "Animals", url: "" },
			{ id: "cat_1", name: "Strategy", url: "" },
		],
	},
	{
		id: "5H5JS0KLzK",
		name: "Azul",
		thumb_url:
			"https://d2k4q26owzy373.cloudfront.net/350x350/games/uploaded/1559254919816",
		avgRating: 4.0,
		description:
			"Azul is an abstract strategy board game designed by Michael Kiesling and published by Next Move Games.",
		year_published: 2017,
		min_players: 2,
		max_players: 4,
		min_age: 8,
		mechanics: [
			{ id: "mech_7", name: "Pattern Building", url: "" },
			{ id: "mech_8", name: "Tile Placement", url: "" },
		],
		categories: [
			{ id: "cat_7", name: "Abstract", url: "" },
			{ id: "cat_4", name: "Family", url: "" },
		],
	},
	{
		id: "GP7Y2xOUzj",
		name: "Pandemic",
		thumb_url:
			"https://d2k4q26owzy373.cloudfront.net/350x350/games/uploaded/1559254945264",
		avgRating: 3.8,
		description:
			"Pandemic is a cooperative board game designed by Matt Leacock and first published by Z-Man Games in 2008.",
		year_published: 2008,
		min_players: 2,
		max_players: 4,
		min_age: 13,
		mechanics: [
			{ id: "mech_9", name: "Cooperative Game", url: "" },
			{ id: "mech_10", name: "Hand Management", url: "" },
		],
		categories: [
			{ id: "cat_8", name: "Medical", url: "" },
			{ id: "cat_9", name: "Cooperative", url: "" },
		],
	},
	{
		id: "7NYbgH2Z2I",
		name: "Splendor",
		thumb_url:
			"https://d2k4q26owzy373.cloudfront.net/350x350/games/uploaded/1559254971843",
		avgRating: 3.7,
		description:
			"Splendor is a fast-paced and addictive game of chip-collecting and card development.",
		year_published: 2014,
		min_players: 2,
		max_players: 4,
		min_age: 10,
		mechanics: [
			{ id: "mech_3", name: "Engine Building", url: "" },
			{ id: "mech_4", name: "Set Collection", url: "" },
		],
		categories: [
			{ id: "cat_3", name: "Economic", url: "" },
			{ id: "cat_10", name: "Renaissance", url: "" },
		],
	},
	{
		id: "BBgNPF8uBt",
		name: "King of Tokyo",
		thumb_url:
			"https://d2k4q26owzy373.cloudfront.net/350x350/games/uploaded/1559254850343",
		avgRating: 3.6,
		description:
			"King of Tokyo is a standalone game in the King of Tokyo series.",
		year_published: 2011,
		min_players: 2,
		max_players: 6,
		min_age: 8,
		mechanics: [
			{ id: "mech_11", name: "Dice Rolling", url: "" },
			{ id: "mech_2", name: "Variable Player Powers", url: "" },
		],
		categories: [
			{ id: "cat_11", name: "Fighting", url: "" },
			{ id: "cat_12", name: "Monsters", url: "" },
		],
	},
];

// Mock mechanics and categories data
export const mockMechanics = [
	{ id: "mech_1", name: "Area Control", url: "" },
	{ id: "mech_2", name: "Variable Player Powers", url: "" },
	{ id: "mech_3", name: "Engine Building", url: "" },
	{ id: "mech_4", name: "Set Collection", url: "" },
	{ id: "mech_5", name: "Route Building", url: "" },
	{ id: "mech_6", name: "Card Drafting", url: "" },
	{ id: "mech_7", name: "Pattern Building", url: "" },
	{ id: "mech_8", name: "Tile Placement", url: "" },
	{ id: "mech_9", name: "Cooperative Game", url: "" },
	{ id: "mech_10", name: "Hand Management", url: "" },
	{ id: "mech_11", name: "Dice Rolling", url: "" },
];

export const mockCategories = [
	{ id: "cat_1", name: "Strategy", url: "" },
	{ id: "cat_2", name: "War", url: "" },
	{ id: "cat_3", name: "Economic", url: "" },
	{ id: "cat_4", name: "Family", url: "" },
	{ id: "cat_5", name: "Trains", url: "" },
	{ id: "cat_6", name: "Animals", url: "" },
	{ id: "cat_7", name: "Abstract", url: "" },
	{ id: "cat_8", name: "Medical", url: "" },
	{ id: "cat_9", name: "Cooperative", url: "" },
	{ id: "cat_10", name: "Renaissance", url: "" },
	{ id: "cat_11", name: "Fighting", url: "" },
	{ id: "cat_12", name: "Monsters", url: "" },
];

// Mock API service functions
export class MockGameService {
	static async searchGames(
		searchTerm: string = "",
		mechanics: string[] = [],
		categories: string[] = [],
		skip: number = 0,
		limit: number = 20
	): Promise<{ games: ThumbGame[] }> {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 300));

		let filteredGames = [...mockGamesDatabase];

		// Filter by search term
		if (searchTerm) {
			filteredGames = filteredGames.filter((game) =>
				game.name.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Filter by mechanics
		if (mechanics.length > 0) {
			filteredGames = filteredGames.filter((game) =>
				game.mechanics?.some((mech) => mechanics.includes(mech.id))
			);
		}

		// Filter by categories
		if (categories.length > 0) {
			filteredGames = filteredGames.filter((game) =>
				game.categories?.some((cat) => categories.includes(cat.id))
			);
		}

		// Apply pagination
		const paginatedGames = filteredGames.slice(skip, skip + limit);

		return {
			games: paginatedGames.map((game) => ({
				id: game.id,
				name: game.name,
				thumb_url: game.thumb_url,
				avgRating: game.avgRating,
			})),
		};
	}

	static async getGameById(id: string): Promise<MockGame | null> {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 200));

		return mockGamesDatabase.find((game) => game.id === id) || null;
	}

	static async getMechanics(): Promise<{
		mechanics: Array<{ id: string; name: string; url: string }>;
	}> {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 100));

		return { mechanics: mockMechanics };
	}

	static async getCategories(): Promise<{
		categories: Array<{ id: string; name: string; url: string }>;
	}> {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 100));

		return { categories: mockCategories };
	}
}
