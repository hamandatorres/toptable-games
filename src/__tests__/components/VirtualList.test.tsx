import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import { useVirtualScroll } from "../../../src/hooks/useVirtualScroll";
import VirtualList from "../../../src/components/VirtualList/VirtualList";

// Mock data for testing
const mockItems = Array.from({ length: 1000 }, (_, i) => ({
	id: i,
	name: `Item ${i}`,
	value: `Value ${i}`,
}));

describe("useVirtualScroll Hook", () => {
	it("should calculate visible items correctly", () => {
		const { result } = renderHook(() =>
			useVirtualScroll(100, {
				itemHeight: 50,
				containerHeight: 300,
				overscan: 2,
			})
		);

		// With 300px container height and 50px items, we expect 6 visible items + 2 overscan on each side = 10 items
		expect(result.current.visibleItems.length).toBeLessThanOrEqual(12); // Should be around 10 items
		expect(result.current.visibleItems.length).toBeGreaterThanOrEqual(6); // At least visible items
		expect(result.current.totalHeight).toBe(5000); // 100 items * 50px
		expect(result.current.offsetY).toBe(0); // Should start at top
	});

	it("should update visible items on scroll", () => {
		const { result } = renderHook(() =>
			useVirtualScroll(100, {
				itemHeight: 50,
				containerHeight: 300,
				overscan: 2,
			})
		);

		// Simulate scroll event
		const mockScrollEvent = {
			currentTarget: { scrollTop: 250 },
		} as React.UIEvent<HTMLDivElement>;

		act(() => {
			result.current.scrollElementProps.onScroll(mockScrollEvent);
		});

		expect(result.current.offsetY).toBeGreaterThan(0);
	});

	it("should handle empty item list", () => {
		const { result } = renderHook(() =>
			useVirtualScroll(0, {
				itemHeight: 50,
				containerHeight: 300,
			})
		);

		expect(result.current.visibleItems).toHaveLength(0);
		expect(result.current.totalHeight).toBe(0);
	});

	it("should respect overscan parameter", () => {
		const { result: resultWithOverscan } = renderHook(() =>
			useVirtualScroll(100, {
				itemHeight: 50,
				containerHeight: 300,
				overscan: 5,
			})
		);

		const { result: resultWithoutOverscan } = renderHook(() =>
			useVirtualScroll(100, {
				itemHeight: 50,
				containerHeight: 300,
				overscan: 0,
			})
		);

		// With overscan should render more items
		expect(resultWithOverscan.current.visibleItems.length).toBeGreaterThan(
			resultWithoutOverscan.current.visibleItems.length
		);
	});
});

describe("VirtualList Component", () => {
	const renderItem = vi.fn((item: (typeof mockItems)[0], index: number) => (
		<div data-testid={`item-${index}`}>
			{item.name}: {item.value}
		</div>
	));

	beforeEach(() => {
		renderItem.mockClear();
	});

	it("should render virtual list with items", () => {
		const testItems = mockItems.slice(0, 10);

		render(
			<VirtualList
				items={testItems}
				itemHeight={50}
				containerHeight={300}
				renderItem={renderItem}
			/>
		);

		// Should render virtual list container
		expect(
			document.querySelector(".virtual-list-container")
		).toBeInTheDocument();

		// Should call renderItem for visible items
		expect(renderItem).toHaveBeenCalled();
	});

	it("should show empty state when no items", () => {
		const emptyComponent = <div data-testid="empty-state">No items found</div>;

		render(
			<VirtualList
				items={[]}
				itemHeight={50}
				containerHeight={300}
				renderItem={renderItem}
				emptyComponent={emptyComponent}
			/>
		);

		expect(screen.getByTestId("empty-state")).toBeInTheDocument();
		expect(screen.getByText("No items found")).toBeInTheDocument();
	});

	it("should show loading state", () => {
		const loadingComponent = <div data-testid="loading-state">Loading...</div>;

		render(
			<VirtualList
				items={[]}
				itemHeight={50}
				containerHeight={300}
				renderItem={renderItem}
				loadingComponent={loadingComponent}
			/>
		);

		expect(screen.getByTestId("loading-state")).toBeInTheDocument();
		expect(screen.getByText("Loading...")).toBeInTheDocument();
	});

	it("should handle scroll events", () => {
		const onScroll = vi.fn();
		const testItems = mockItems.slice(0, 100);

		render(
			<VirtualList
				items={testItems}
				itemHeight={50}
				containerHeight={300}
				renderItem={renderItem}
				onScroll={onScroll}
			/>
		);

		const container = document.querySelector(".virtual-list-container");
		expect(container).toBeInTheDocument();

		// Simulate scroll
		fireEvent.scroll(container!, { target: { scrollTop: 500 } });

		expect(onScroll).toHaveBeenCalledWith(500);
	});

	it("should use custom key extractor", () => {
		const keyExtractor = vi.fn(
			(item: (typeof mockItems)[0]) => `custom-${item.id}`
		);
		const testItems = mockItems.slice(0, 5);

		render(
			<VirtualList
				items={testItems}
				itemHeight={50}
				containerHeight={300}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
			/>
		);

		expect(keyExtractor).toHaveBeenCalled();
	});

	it("should apply custom className", () => {
		const testItems = mockItems.slice(0, 5);

		render(
			<VirtualList
				items={testItems}
				itemHeight={50}
				containerHeight={300}
				renderItem={renderItem}
				className="custom-virtual-list"
			/>
		);

		const container = document.querySelector(".virtual-list-container");
		expect(container).toHaveClass("custom-virtual-list");
	});
});

describe("VirtualList Performance", () => {
	it("should only render visible items for large datasets", () => {
		const renderItem = vi.fn((item: (typeof mockItems)[0], index: number) => (
			<div data-testid={`item-${index}`}>{item.name}</div>
		));

		// Large dataset
		const largeItemSet = mockItems; // 1000 items

		render(
			<VirtualList
				items={largeItemSet}
				itemHeight={50}
				containerHeight={300}
				renderItem={renderItem}
			/>
		);

		// Should not render all 1000 items, only visible ones + overscan
		// With 300px container and 50px items, expect around 6-12 items rendered (visible + overscan)
		expect(renderItem.mock.calls.length).toBeGreaterThan(5); // At least some items
		expect(renderItem.mock.calls.length).toBeLessThan(20); // Much less than total items
	});

	it("should handle rapid scroll events efficiently", () => {
		const renderItem = vi.fn((item: (typeof mockItems)[0]) => (
			<div>{item.name}</div>
		));
		const testItems = mockItems.slice(0, 100);

		render(
			<VirtualList
				items={testItems}
				itemHeight={50}
				containerHeight={300}
				renderItem={renderItem}
			/>
		);

		const container = document.querySelector(".virtual-list-container");
		const initialRenderCount = renderItem.mock.calls.length;

		// Simulate rapid scrolling
		for (let i = 0; i < 10; i++) {
			fireEvent.scroll(container!, { target: { scrollTop: i * 50 } });
		}

		// Should not cause excessive re-renders - allow for reasonable increase
		// Virtual scrolling should keep render calls manageable even with rapid scrolling
		expect(renderItem.mock.calls.length).toBeLessThan(initialRenderCount * 15); // More lenient threshold
	});
});
