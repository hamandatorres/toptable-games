// Migration script to import existing game data into Strapi CMS
import { MockGame, mockGamesDatabase } from "../../src/services/mockGameData";

interface StrapiGame {
	data: {
		name: string;
		description?: string;
		year_published?: number;
		min_players?: number;
		max_players?: number;
		min_age?: number;
		avgRating?: number;
		thumb_url?: string;
		bgg_id?: number;
		publishedAt?: string;
	};
}

interface StrapiMechanic {
	data: {
		name: string;
		description?: string;
		publishedAt?: string;
	};
}

interface StrapiCategory {
	data: {
		name: string;
		description?: string;
		publishedAt?: string;
	};
}

const STRAPI_BASE_URL = "http://localhost:1337/api";

// Helper function to make API calls to Strapi
async function strapiRequest(
	endpoint: string,
	method: "GET" | "POST" | "PUT" = "GET",
	data?: any
) {
	const url = `${STRAPI_BASE_URL}${endpoint}`;
	const options: RequestInit = {
		method,
		headers: {
			"Content-Type": "application/json",
		},
	};

	if (data && method !== "GET") {
		options.body = JSON.stringify(data);
	}

	try {
		const response = await fetch(url, options);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		console.error(`Error with ${method} ${endpoint}:`, error);
		throw error;
	}
}

// Create mechanics in Strapi
async function createMechanics() {
	console.log("🔧 Creating game mechanics...");

	const mechanicsSet = new Set<string>();

	// Collect all unique mechanics from our games
	mockGamesDatabase.forEach((game) => {
		game.mechanics?.forEach((mechanic) => {
			mechanicsSet.add(mechanic.name);
		});
	});

	for (const mechanicName of mechanicsSet) {
		const mechanicData: StrapiMechanic = {
			data: {
				name: mechanicName,
				description: `Game mechanic: ${mechanicName}`,
				publishedAt: new Date().toISOString(),
			},
		};

		try {
			await strapiRequest("/mechanics", "POST", mechanicData);
			console.log(`✅ Created mechanic: ${mechanicName}`);
		} catch (error) {
			console.log(`⚠️  Mechanic ${mechanicName} might already exist`);
		}
	}
}

// Create categories in Strapi
async function createCategories() {
	console.log("🏷️  Creating game categories...");

	const categoriesSet = new Set<string>();

	// Collect all unique categories from our games
	mockGamesDatabase.forEach((game) => {
		game.categories?.forEach((category) => {
			categoriesSet.add(category.name);
		});
	});

	for (const categoryName of categoriesSet) {
		const categoryData: StrapiCategory = {
			data: {
				name: categoryName,
				description: `Game category: ${categoryName}`,
				publishedAt: new Date().toISOString(),
			},
		};

		try {
			await strapiRequest("/categories", "POST", categoryData);
			console.log(`✅ Created category: ${categoryName}`);
		} catch (error) {
			console.log(`⚠️  Category ${categoryName} might already exist`);
		}
	}
}

// Get mechanic and category IDs for relations
async function getMechanicId(name: string): Promise<number | null> {
	try {
		const response = await strapiRequest(
			`/mechanics?filters[name][$eq]=${encodeURIComponent(name)}`
		);
		return response.data.length > 0 ? response.data[0].id : null;
	} catch (error) {
		console.error(`Error getting mechanic ID for ${name}:`, error);
		return null;
	}
}

async function getCategoryId(name: string): Promise<number | null> {
	try {
		const response = await strapiRequest(
			`/categories?filters[name][$eq]=${encodeURIComponent(name)}`
		);
		return response.data.length > 0 ? response.data[0].id : null;
	} catch (error) {
		console.error(`Error getting category ID for ${name}:`, error);
		return null;
	}
}

// Create games in Strapi
async function createGames() {
	console.log("🎲 Creating games...");

	for (const game of mockGamesDatabase) {
		// Get mechanic IDs
		const mechanicIds: number[] = [];
		if (game.mechanics) {
			for (const mechanic of game.mechanics) {
				const id = await getMechanicId(mechanic.name);
				if (id) mechanicIds.push(id);
			}
		}

		// Get category IDs
		const categoryIds: number[] = [];
		if (game.categories) {
			for (const category of game.categories) {
				const id = await getCategoryId(category.name);
				if (id) categoryIds.push(id);
			}
		}

		const gameData: StrapiGame = {
			data: {
				name: game.name,
				description: game.description,
				year_published: game.year_published,
				min_players: game.min_players,
				max_players: game.max_players,
				min_age: game.min_age,
				avgRating: game.avgRating,
				thumb_url: game.thumb_url,
				bgg_id: parseInt(game.id.replace(/[^0-9]/g, "")) || undefined,
				publishedAt: new Date().toISOString(),
			},
		};

		try {
			const createdGame = await strapiRequest("/games", "POST", gameData);
			console.log(`✅ Created game: ${game.name}`);

			// Add relations
			if (mechanicIds.length > 0) {
				await strapiRequest(`/games/${createdGame.data.id}`, "PUT", {
					data: {
						mechanics: mechanicIds,
					},
				});
				console.log(`  🔧 Added ${mechanicIds.length} mechanics`);
			}

			if (categoryIds.length > 0) {
				await strapiRequest(`/games/${createdGame.data.id}`, "PUT", {
					data: {
						categories: categoryIds,
					},
				});
				console.log(`  🏷️  Added ${categoryIds.length} categories`);
			}
		} catch (error) {
			console.log(
				`⚠️  Game ${game.name} might already exist or error occurred:`,
				error
			);
		}
	}
}

// Main migration function
export async function migrateGamesToStrapi() {
	console.log("🚀 Starting migration to Strapi CMS...");
	console.log(`📊 Migrating ${mockGamesDatabase.length} games`);

	try {
		// Wait a moment for Strapi to be ready
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Create mechanics first (needed for relations)
		await createMechanics();

		// Create categories (needed for relations)
		await createCategories();

		// Create games with relations
		await createGames();

		console.log("🎉 Migration completed successfully!");
		console.log(
			"🌐 Visit http://localhost:1337/admin to see your games in the CMS"
		);
	} catch (error) {
		console.error("❌ Migration failed:", error);
	}
}

// Run migration if this file is executed directly
if (require.main === module) {
	migrateGamesToStrapi();
}

// Export for use in other files
export default migrateGamesToStrapi;
