import React, { ReactNode, useRef } from "react";
import { useVirtualScroll } from "../../hooks/useVirtualScroll";
import "./VirtualList.css";

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

	return (
		<div
			ref={containerRef}
			className={`virtual-list-container ${className}`}
			data-container-height={containerHeight}
			style={scrollElementProps.style}
			onScroll={handleScroll}
		>
			<div className="virtual-list-inner" style={innerElementProps.style}>
				<div
					className="virtual-list-viewport"
					data-offset-y={offsetY}
					style={{
						transform: `translateY(${offsetY}px)`,
					}}
				>
					{visibleItems.map((index: number) => {
						const item = items[index];
						if (!item) return null;

						return (
							<div
								key={keyExtractor(item, index)}
								className="virtual-list-item"
								data-item-height={itemHeight}
								data-index={index}
								style={{
									height: `${itemHeight}px`,
								}}
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
