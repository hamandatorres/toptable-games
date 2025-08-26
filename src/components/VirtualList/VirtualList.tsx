// Virtual scrolling requires inline styles for performance - these are dynamic values
// that change frequently during scrolling and must be applied directly for optimal performance

import React, { ReactNode, useRef } from "react";
import { useVirtualScroll } from "../../hooks/useVirtualScroll";
// Import styles from main SCSS - virtual list styles are included in the main stylesheet

interface VirtualListProps<T> {
	items: T[];
	itemHeight: number;
	containerHeight: number;
	renderItem: (item: T, index: number) => ReactNode;
	overscan?: number;
	className?: string;
	onScroll?: ((scrollTop: number) => void) | undefined;
	loadingComponent?: ReactNode;
	emptyComponent?: ReactNode;
	keyExtractor?: (item: T, index: number) => string | number;
}

export function VirtualList<T>({
	items,
	itemHeight,
	containerHeight,
	renderItem,
	overscan = 3,
	className = "",
	onScroll,
	loadingComponent,
	emptyComponent,
	keyExtractor = (_, index) => index,
}: VirtualListProps<T>) {
	const containerRef = useRef<HTMLDivElement>(null);

	const { visibleItems, offsetY, scrollElementProps, innerElementProps } =
		useVirtualScroll(items.length, {
			itemHeight,
			containerHeight,
			overscan,
		});

	// Custom scroll handler
	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		scrollElementProps.onScroll(e);
		onScroll?.(e.currentTarget.scrollTop);
	};

	// Show loading state
	if (!items.length && loadingComponent) {
		return (
			<div
				className={`virtual-list-container virtual-list-loading ${className}`}
				data-container-height={containerHeight}
			>
				{loadingComponent}
			</div>
		);
	}

	// Show empty state
	if (!items.length && emptyComponent) {
		return (
			<div
				className={`virtual-list-container virtual-list-empty ${className}`}
				data-container-height={containerHeight}
			>
				{emptyComponent}
			</div>
		);
	}

	// Set CSS custom properties for dynamic styling
	const containerStyle = {
		"--vl-container-height": `${containerHeight}px`,
		"--vl-overflow": scrollElementProps.style.overflow || "auto",
	} as React.CSSProperties;

	const innerStyle = {
		"--vl-inner-height": innerElementProps.style.height || "auto",
	} as React.CSSProperties;

	const viewportStyle = {
		"--vl-offset-y": `${offsetY}px`,
	} as React.CSSProperties;

	return (
		<div
			ref={containerRef}
			className={`virtual-list-container ${className}`}
			data-container-height={containerHeight}
			style={containerStyle}
			onScroll={handleScroll}
		>
			<div className="virtual-list-inner" style={innerStyle}>
				<div
					className="virtual-list-viewport"
					data-offset-y={offsetY}
					style={viewportStyle}
				>
					{visibleItems.map((index: number) => {
						const item = items[index];
						if (!item) return null;

						const itemStyle = {
							"--vl-item-height": `${itemHeight}px`,
						} as React.CSSProperties;

						return (
							<div
								key={keyExtractor(item, index)}
								className="virtual-list-item"
								data-item-height={itemHeight}
								data-index={index}
								style={itemStyle}
							>
								{renderItem(item, index)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default VirtualList;
