/// <reference types="react" />

declare module "customTypes" {
	export type Option = {
		id: string;
		name: string;
		url: string;
	};

	export type OptionNoName = {
		id: string;
		url: string;
	};

	export type Review = {
		username: string;
		rating: number;
		review: string | null;
	};

	export type ThumbGame = {
		id: string;
		name: string;
		thumb_url: string;
		avgRating: number;
	};

	export type PlayerCount = {
		username?: string;
		total?: number;
	};

	export type GameDispProps = {
		match: {
			params: {
				id: string;
			};
		};
	};

	export type GameBoxProps = {
		thumbGame: ThumbGame;
	};

	export type SearchProps = {
		getAPIGames: (
			currentPage: number,
			searchEntry: string,
			mechanicsSelections: string[],
			categoriesSelections: string[],
			itemsPerPage: string
		) => void;
	};

	export type Player = {
		username: string;
		total: string;
	};

	export type User = {
		firstName?: string;
		lastName?: string;
		email: string;
		username: string;
	};

	export type UserReview = {
		review?: string;
	};

	export type DBGame = {
		id: number;
		user_id: number;
		game_id: string;
		play_count: number;
		rating: number;
		review: string;
	};

	export type ReviewProps = {
		game_id: string;
	};

	export type UserReview = {
		userID?: number;
		gameID?: string;
		review?: string;
	};
}
