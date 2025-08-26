import React, { useMemo } from "react";
import { ThumbGame } from "customTypes";
import GameBox from "./GameBox";
import VirtualList from "../VirtualList/VirtualList";
import "./VirtualizedGameList.css";

interface VirtualizedGameListProps {
	games: ThumbGame[];
	containerHeight: number;
	itemHeight?: number;
	overscan?: number;
	className?: string;
	onScroll?: (scrollTop: number) => void;
	emptyMessage?: {
		title: string;
		description: string;
		action?: string;
	};
}

const VirtualizedGameList: React.FC<VirtualizedGameListProps> = ({
	games,
	containerHeight,
	itemHeight = 320, // Estimated height of GameBox component
	overscan = 3,
	className = "",
	onScroll,
	emptyMessage = {
		title: "Welcome to TopTable Games!",
		description: "Search for board games using the search bar above.",
		action: 'Click "Search" with no filters to see all available games.',
	},
}) => {
	// Memoize the render function to prevent unnecessary re-renders
	const renderGameItem = useMemo(() => {
		return (game: ThumbGame) => (
			<div key={game.id} className="virtual-game-item">
				<GameBox thumbGame={game} />
			</div>
		);
	}, []);

	// Memoize the key extractor
	const keyExtractor = useMemo(() => {
		return (game: ThumbGame, index: number) => game.id || index;
	}, []);

	// Memoize the empty component
	const emptyComponent = useMemo(
		() => (
			<div className="no-results">
				<h2>{emptyMessage.title}</h2>
				<p>{emptyMessage.description}</p>
				{emptyMessage.action && <p>{emptyMessage.action}</p>}
			</div>
		),
		[emptyMessage]
	);

	// Memoize the loading component
	const loadingComponent = useMemo(
		() => (
			<div className="loading-games">
				<div className="loading-spinner"></div>
				<p>Loading games...</p>
			</div>
		),
		[]
	);

	return (
		<VirtualList
			items={games}
			itemHeight={itemHeight}
			containerHeight={containerHeight}
			renderItem={renderGameItem}
			overscan={overscan}
			className={`virtualized-game-list ${className}`}
			onScroll={onScroll || undefined}
			keyExtractor={keyExtractor}
			emptyComponent={emptyComponent}
			loadingComponent={games.length === 0 ? loadingComponent : undefined}
		/>
	);
};

export default VirtualizedGameList;
