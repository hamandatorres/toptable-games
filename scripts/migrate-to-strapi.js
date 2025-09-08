// Simple Node.js script to migrate games to Strapi
const fetch = require("node-fetch");

// Mock games data (simplified)
const mockGamesDatabase = [
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
		mechanics: [{ name: "Area Control" }, { name: "Variable Player Powers" }],
		categories: [{ name: "Strategy" }, { name: "Adventure" }],
	},
	{
		id: "YMaZvwD2Xx",
		name: "Catan",
		thumb_url:
			"https://d2k4q26owzy373.cloudfront.net/350x350/games/uploaded/1559254023742",
		avgRating: 3.9,
		description:
			"Catan is a board game for three to four players, designed by Klaus Teuber.",
		year_published: 1995,
		min_players: 3,
		max_players: 4,
		min_age: 10,
		mechanics: [{ name: "Dice Rolling" }, { name: "Trading" }],
		categories: [{ name: "Strategy" }, { name: "Family" }],
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
		mechanics: [{ name: "Set Collection" }, { name: "Route Building" }],
		categories: [{ name: "Family" }, { name: "Trains" }],
	},
];

const STRAPI_BASE_URL = "http://localhost:1337/api";

async function strapiRequest(endpoint, method = "GET", data = null) {
	const url = `${STRAPI_BASE_URL}${endpoint}`;
	const options = {
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
		const result = await response.json();

		if (!response.ok) {
			console.log(`API Error:`, result);
			return null;
		}

		return result;
	} catch (error) {
		console.error(`Error with ${method} ${endpoint}:`, error.message);
		return null;
	}
}

async function createMechanics() {
	console.log("🔧 Creating game mechanics...");

	const mechanicsSet = new Set();
	mockGamesDatabase.forEach((game) => {
		game.mechanics?.forEach((mechanic) => {
			mechanicsSet.add(mechanic.name);
		});
	});

	for (const mechanicName of mechanicsSet) {
		const result = await strapiRequest("/mechanics", "POST", {
			data: {
				name: mechanicName,
				description: `Game mechanic: ${mechanicName}`,
			},
		});

		if (result) {
			console.log(`✅ Created mechanic: ${mechanicName}`);
		} else {
			console.log(`⚠️  Mechanic ${mechanicName} might already exist`);
		}
	}
}

async function createCategories() {
	console.log("🏷️  Creating game categories...");

	const categoriesSet = new Set();
	mockGamesDatabase.forEach((game) => {
		game.categories?.forEach((category) => {
			categoriesSet.add(category.name);
		});
	});

	for (const categoryName of categoriesSet) {
		const result = await strapiRequest("/categories", "POST", {
			data: {
				name: categoryName,
				description: `Game category: ${categoryName}`,
			},
		});

		if (result) {
			console.log(`✅ Created category: ${categoryName}`);
		} else {
			console.log(`⚠️  Category ${categoryName} might already exist`);
		}
	}
}

async function createGames() {
	console.log("🎲 Creating games...");

	for (const game of mockGamesDatabase) {
		const result = await strapiRequest("/games", "POST", {
			data: {
				name: game.name,
				description: game.description,
				year_published: game.year_published,
				min_players: game.min_players,
				max_players: game.max_players,
				min_age: game.min_age,
				avgRating: game.avgRating,
				thumb_url: game.thumb_url,
			},
		});

		if (result) {
			console.log(`✅ Created game: ${game.name}`);
		} else {
			console.log(`⚠️  Game ${game.name} might already exist`);
		}
	}
}

async function migrateGamesToStrapi() {
	console.log("🚀 Starting migration to Strapi CMS...");
	console.log(`📊 Migrating ${mockGamesDatabase.length} games`);

	try {
		// Wait for Strapi to be ready
		console.log("⏳ Waiting for Strapi to be ready...");
		await new Promise((resolve) => setTimeout(resolve, 3000));

		await createMechanics();
		await createCategories();
		await createGames();

		console.log("🎉 Migration completed successfully!");
		console.log(
			"🌐 Visit http://localhost:1337/admin to see your games in the CMS"
		);
	} catch (error) {
		console.error("❌ Migration failed:", error);
	}
}

// Run the migration
migrateGamesToStrapi();
