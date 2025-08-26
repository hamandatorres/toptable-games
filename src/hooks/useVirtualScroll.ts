import { useState, useEffect, useMemo, useCallback } from "react";

interface VirtualScrollOptions {
	itemHeight: number;
	containerHeight: number;
	overscan?: number; // Number of items to render outside visible area
	buffer?: number; // Buffer space in pixels
}

interface VirtualScrollResult {
	visibleItems: number[];
	totalHeight: number;
	offsetY: number;
	scrollElementProps: {
		style: {
			height: string;
			overflow: "auto";
		};
		onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
	};
	innerElementProps: {
		style: {
			height: string;
			position: "relative";
		};
	};
}

export const useVirtualScroll = (
	itemCount: number,
	options: VirtualScrollOptions
): VirtualScrollResult => {
	const [scrollTop, setScrollTop] = useState(0);

	const { itemHeight, containerHeight, overscan = 3, buffer = 0 } = options;

	// Calculate visible range
	const visibleRange = useMemo(() => {
		const visibleStart = Math.floor(scrollTop / itemHeight);
		const visibleEnd = Math.min(
			itemCount - 1,
			Math.ceil((scrollTop + containerHeight) / itemHeight)
		);

		// Add overscan to reduce flicker
		const start = Math.max(0, visibleStart - overscan);
		const end = Math.min(itemCount - 1, visibleEnd + overscan);

		return { start, end };
	}, [scrollTop, itemHeight, containerHeight, itemCount, overscan]);

	// Get visible items array
	const visibleItems = useMemo(() => {
		const items = [];
		for (let i = visibleRange.start; i <= visibleRange.end; i++) {
			items.push(i);
		}
		return items;
	}, [visibleRange]);

	// Calculate total height
	const totalHeight = itemHeight * itemCount + buffer;

	// Calculate offset for absolute positioning
	const offsetY = visibleRange.start * itemHeight;

	// Handle scroll events
	const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
		setScrollTop(e.currentTarget.scrollTop);
	}, []);

	// Reset scroll position when itemCount changes significantly
	useEffect(() => {
		if (scrollTop > totalHeight) {
			setScrollTop(0);
		}
	}, [totalHeight, scrollTop]);

	return {
		visibleItems,
		totalHeight,
		offsetY,
		scrollElementProps: {
			style: {
				height: `${containerHeight}px`,
				overflow: "auto",
			},
			onScroll: handleScroll,
		},
		innerElementProps: {
			style: {
				height: `${totalHeight}px`,
				position: "relative",
			},
		},
	};
};

// Hook for calculating dynamic item heights (more advanced)
export const useVariableHeightVirtualScroll = (
	itemCount: number,
	estimatedItemHeight: number,
	containerHeight: number,
	getItemHeight: (index: number) => number,
	overscan: number = 3
) => {
	const [scrollTop, setScrollTop] = useState(0);
	const [itemHeights, setItemHeights] = useState<number[]>([]);

	// Cache item heights using the provided getItemHeight function
	const heights = useMemo(() => {
		const heights = new Array(itemCount);
		for (let i = 0; i < itemCount; i++) {
			// Use cached height if available, otherwise get it from the callback, fallback to estimated
			heights[i] = itemHeights[i] ?? getItemHeight(i) ?? estimatedItemHeight;
		}
		return heights;
	}, [itemCount, itemHeights, getItemHeight, estimatedItemHeight]);

	// Calculate item positions
	const itemPositions = useMemo(() => {
		const positions = new Array(itemCount);
		positions[0] = 0;
		for (let i = 1; i < itemCount; i++) {
			positions[i] = positions[i - 1] + heights[i - 1];
		}
		return positions;
	}, [heights, itemCount]);

	// Find visible range using binary search for better performance
	const visibleRange = useMemo(() => {
		if (itemCount === 0) return { start: 0, end: 0 };

		// Binary search for start
		let start = 0;
		let end = itemCount - 1;
		while (start < end) {
			const mid = Math.floor((start + end) / 2);
			if (itemPositions[mid] < scrollTop) {
				start = mid + 1;
			} else {
				end = mid;
			}
		}
		const visibleStart = Math.max(0, start - 1);

		// Linear search for end (usually just a few items)
		let visibleEnd = visibleStart;
		while (
			visibleEnd < itemCount - 1 &&
			itemPositions[visibleEnd] < scrollTop + containerHeight
		) {
			visibleEnd++;
		}

		return {
			start: Math.max(0, visibleStart - overscan),
			end: Math.min(itemCount - 1, visibleEnd + overscan),
		};
	}, [scrollTop, containerHeight, itemPositions, itemCount, overscan]);

	const visibleItems = useMemo(() => {
		const items = [];
		for (let i = visibleRange.start; i <= visibleRange.end; i++) {
			items.push(i);
		}
		return items;
	}, [visibleRange]);

	const totalHeight = itemPositions[itemCount - 1] + heights[itemCount - 1];
	const offsetY = itemPositions[visibleRange.start] || 0;

	const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
		setScrollTop(e.currentTarget.scrollTop);
	}, []);

	// Method to update item height after measurement
	const setItemHeight = useCallback((index: number, height: number) => {
		setItemHeights((prev) => {
			const newHeights = [...prev];
			newHeights[index] = height;
			return newHeights;
		});
	}, []);

	return {
		visibleItems,
		totalHeight,
		offsetY,
		setItemHeight,
		scrollElementProps: {
			style: {
				height: `${containerHeight}px`,
				overflow: "auto" as const,
			},
			onScroll: handleScroll,
		},
		innerElementProps: {
			style: {
				height: `${totalHeight}px`,
				position: "relative" as const,
			},
		},
	};
};
