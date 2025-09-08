// Strapi Game Service - Professional CMS integration for TopTable Games
import { ThumbGame } from "customTypes";

interface StrapiResponse<T> {
	data: T[];
	meta: {
		pagination: {
			page: number;
			pageSize: number;
			pageCount: number;
			total: number;
		};
	};
}

interface StrapiSingleResponse<T> {
	data: T;
	meta: Record<string, unknown>;
}

interface StrapiGame {
	id: number;
	attributes: {
		name: string;
		description?: string;
		year_published?: number;
		min_players?: number;
		max_players?: number;
		min_age?: number;
		playtime_min?: number;
		playtime_max?: number;
		complexity?: number;
		avgRating?: number;
		thumb_url?: string;
		bgg_id?: number;
		createdAt: string;
		updatedAt: string;
		publishedAt: string;
		mechanics?: {
			data: Array<{
				id: number;
				attributes: {
					name: string;
					description?: string;
				};
			}>;
		};
		categories?: {
			data: Array<{
				id: number;
				attributes: {
					name: string;
					description?: string;
				};
			}>;
		};
		designers?: {
			data: Array<{
				id: number;
				attributes: {
					name: string;
					bio?: string;
				};
			}>;
		};
		publishers?: {
			data: Array<{
				id: number;
				attributes: {
					name: string;
					founded_year?: number;
				};
			}>;
		};
	};
}

export class StrapiGameService {
	private static BASE_URL =
		process.env.VITE_STRAPI_URL || "http://localhost:1337/api";

	// Helper function for API requests
	private static async strapiRequest<T>(endpoint: string): Promise<T | null> {
		try {
			const response = await fetch(`${this.BASE_URL}${endpoint}`);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error(`Strapi API Error (${endpoint}):`, error);
			return null;
		}
	}

	// Transform Strapi game data to ThumbGame format
	private static transformStrapiGame(strapiGame: StrapiGame): ThumbGame {
		const { attributes } = strapiGame;

		return {
			id: strapiGame.id.toString(),
			name: attributes.name,
			description: attributes.description,
			year_published: attributes.year_published,
			min_players: attributes.min_players,
			max_players: attributes.max_players,
			min_age: attributes.min_age,
			avgRating: attributes.avgRating || -1,
			thumb_url: attributes.thumb_url || "",
			mechanics: attributes.mechanics?.data.map((m) => ({
				id: m.id.toString(),
				name: m.attributes.name,
				url: "",
			})),
			categories: attributes.categories?.data.map((c) => ({
				id: c.id.toString(),
				name: c.attributes.name,
				url: "",
			})),
		};
	}

	// Get all games with full population
	static async getAllGames(): Promise<ThumbGame[]> {
		const data = await this.strapiRequest<StrapiResponse<StrapiGame>>(
			"/games?populate=*&pagination[pageSize]=100&sort=name:asc"
		);

		if (!data) return [];

		return data.data.map(this.transformStrapiGame);
	}

	// Search games with advanced filtering
	static async searchGames(
		searchTerm: string = "",
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_mechanics: string[] = [],
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_categories: string[] = [],
		skip: number = 0,
		limit: number = 20,
		advancedFilters?: {
			minPlayers?: number | null;
			maxPlayers?: number | null;
			minAge?: number | null;
			maxAge?: number | null;
			minYear?: number | null;
			maxYear?: number | null;
			minRating?: number | null;
			maxRating?: number | null;
			sortBy?: string;
			sortOrder?: "asc" | "desc";
		}
	): Promise<{ games: ThumbGame[]; total: number }> {
		// Build URL with filters
		let endpoint = "/games?populate=*";

		// Search term filter
		if (searchTerm.trim()) {
			endpoint += `&filters[name][$containsi]=${encodeURIComponent(
				searchTerm
			)}`;
		}

		// Advanced filters
		if (advancedFilters) {
			const {
				minPlayers,
				maxPlayers,
				minAge,
				maxAge,
				minYear,
				maxYear,
				minRating,
				maxRating,
				sortBy = "name",
				sortOrder = "asc",
			} = advancedFilters;

			if (minPlayers !== null && minPlayers !== undefined) {
				endpoint += `&filters[max_players][$gte]=${minPlayers}`;
			}

			if (maxPlayers !== null && maxPlayers !== undefined) {
				endpoint += `&filters[min_players][$lte]=${maxPlayers}`;
			}

			if (minAge !== null && minAge !== undefined) {
				endpoint += `&filters[min_age][$gte]=${minAge}`;
			}

			if (maxAge !== null && maxAge !== undefined) {
				endpoint += `&filters[min_age][$lte]=${maxAge}`;
			}

			if (minYear !== null && minYear !== undefined) {
				endpoint += `&filters[year_published][$gte]=${minYear}`;
			}

			if (maxYear !== null && maxYear !== undefined) {
				endpoint += `&filters[year_published][$lte]=${maxYear}`;
			}

			if (minRating !== null && minRating !== undefined) {
				endpoint += `&filters[avgRating][$gte]=${minRating}`;
			}

			if (maxRating !== null && maxRating !== undefined) {
				endpoint += `&filters[avgRating][$lte]=${maxRating}`;
			}

			// Sorting
			endpoint += `&sort=${sortBy}:${sortOrder}`;
		}

		// Pagination
		endpoint += `&pagination[start]=${skip}&pagination[limit]=${limit}`;

		const data = await this.strapiRequest<StrapiResponse<StrapiGame>>(endpoint);

		if (!data) {
			return { games: [], total: 0 };
		}

		return {
			games: data.data.map(this.transformStrapiGame),
			total: data.meta.pagination.total,
		};
	}

	// Get single game by ID
	static async getGameById(id: string): Promise<ThumbGame | null> {
		const data = await this.strapiRequest<StrapiSingleResponse<StrapiGame>>(
			`/games/${id}?populate=*`
		);

		if (!data) return null;

		return this.transformStrapiGame(data.data);
	}

	// Get games by category
	static async getGamesByCategory(categoryName: string): Promise<ThumbGame[]> {
		const data = await this.strapiRequest<StrapiResponse<StrapiGame>>(
			`/games?populate=*&filters[categories][name][$containsi]=${encodeURIComponent(
				categoryName
			)}`
		);

		if (!data) return [];

		return data.data.map(this.transformStrapiGame);
	}

	// Get games by mechanic
	static async getGamesByMechanic(mechanicName: string): Promise<ThumbGame[]> {
		const data = await this.strapiRequest<StrapiResponse<StrapiGame>>(
			`/games?populate=*&filters[mechanics][name][$containsi]=${encodeURIComponent(
				mechanicName
			)}`
		);

		if (!data) return [];

		return data.data.map(this.transformStrapiGame);
	}

	// Get all mechanics
	static async getAllMechanics(): Promise<
		Array<{ id: string; name: string; url: string }>
	> {
		const data = await this.strapiRequest<
			StrapiResponse<{ id: number; attributes: { name: string } }>
		>("/mechanics?pagination[pageSize]=100&sort=name:asc");

		if (!data) return [];

		return data.data.map((mechanic) => ({
			id: mechanic.id.toString(),
			name: mechanic.attributes.name,
			url: "",
		}));
	}

	// Get all categories
	static async getAllCategories(): Promise<
		Array<{ id: string; name: string; url: string }>
	> {
		const data = await this.strapiRequest<
			StrapiResponse<{ id: number; attributes: { name: string } }>
		>("/categories?pagination[pageSize]=100&sort=name:asc");

		if (!data) return [];

		return data.data.map((category) => ({
			id: category.id.toString(),
			name: category.attributes.name,
			url: "",
		}));
	}

	// Health check - verify Strapi is accessible
	static async healthCheck(): Promise<boolean> {
		try {
			const response = await fetch(
				`${this.BASE_URL.replace("/api", "")}/admin/init`
			);
			return response.ok;
		} catch (error) {
			console.warn("Strapi health check failed:", error);
			return false;
		}
	}

	// Get total games count
	static async getTotalGamesCount(): Promise<number> {
		const data = await this.strapiRequest<StrapiResponse<StrapiGame>>(
			"/games?pagination[pageSize]=1"
		);

		return data?.meta.pagination.total || 0;
	}
}

export default StrapiGameService;
