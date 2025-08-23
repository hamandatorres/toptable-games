import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./Button";
import { renderWithProviders } from "../../test/test-utils";

describe("Button Component", () => {
	it("renders with text content", () => {
		renderWithProviders(<Button>Click me</Button>);

		expect(
			screen.getByRole("button", { name: "Click me" })
		).toBeInTheDocument();
	});

	it("handles click events", async () => {
		const user = userEvent.setup();
		const handleClick = vi.fn();

		renderWithProviders(<Button onClick={handleClick}>Click me</Button>);

		const button = screen.getByRole("button", { name: "Click me" });
		await user.click(button);

		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("can be disabled", () => {
		renderWithProviders(<Button disabled>Disabled button</Button>);

		const button = screen.getByRole("button", { name: "Disabled button" });
		expect(button).toBeDisabled();
	});

	it("applies custom props", () => {
		renderWithProviders(
			<Button type="submit" id="test-button">
				Submit
			</Button>
		);

		const button = screen.getByRole("button", { name: "Submit" });
		expect(button).toHaveAttribute("type", "submit");
		expect(button).toHaveAttribute("id", "test-button");
	});

	it("renders children correctly", () => {
		renderWithProviders(
			<Button>
				<span>Icon</span>
				Text
			</Button>
		);

		expect(screen.getByText("Icon")).toBeInTheDocument();
		expect(screen.getByText("Text")).toBeInTheDocument();
	});
});
