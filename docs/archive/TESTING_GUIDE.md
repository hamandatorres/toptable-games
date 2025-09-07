# Testing Guide for TopTable Games

This project uses **Vitest** and **React Testing Library** for comprehensive component testing.

## 🧪 Testing Stack

- **Vitest**: Fast testing framework with Vite integration
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM elements
- **@testing-library/user-event**: User interaction simulation
- **jsdom**: DOM environment for tests

## 🚀 Quick Start

### Running Tests

```bash
# Run tests in watch mode (development)
npm test

# Run tests once
npm run test:run

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test SearchBar
npm test Button
```

### Test File Structure

Tests are located alongside components with `.test.tsx` extension:

```
src/components/
├── Games/
│   ├── SearchBar.tsx
│   ├── SearchBar.test.tsx
│   ├── GameBox.tsx
│   └── GameBox.test.tsx
└── StyledComponents/
    ├── Button.tsx
    └── Button.test.tsx
```

## 📝 Testing Patterns

### 1. Basic Component Testing

```typescript
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import Button from "./Button";

describe("Button Component", () => {
	it("renders with text content", () => {
		renderWithProviders(<Button>Click me</Button>);

		expect(
			screen.getByRole("button", { name: "Click me" })
		).toBeInTheDocument();
	});
});
```

### 2. User Interaction Testing

```typescript
import userEvent from "@testing-library/user-event";

it("handles click events", async () => {
	const user = userEvent.setup();
	const handleClick = vi.fn();

	renderWithProviders(<Button onClick={handleClick}>Click me</Button>);

	await user.click(screen.getByRole("button"));

	expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### 3. Redux-Connected Components

```typescript
it("renders with Redux state", () => {
	const mockState = {
		userReducer: {
			/* user state */
		},
		userGameReducer: {
			/* game state */
		},
		meccatReducer: {
			/* mechanic/category state */
		},
	};

	renderWithProviders(<SearchBar {...props} />, {
		preloadedState: mockState,
	});

	// Test component behavior with Redux state
});
```

### 4. Async Behavior Testing

```typescript
import { waitFor } from "@testing-library/react";

it("handles debounced search input", async () => {
	const user = userEvent.setup();
	const mockSearch = vi.fn();

	renderWithProviders(<SearchBar getAPIGames={mockSearch} />);

	await user.type(screen.getByPlaceholderText("game title"), "Wingspan");

	await waitFor(
		() => {
			expect(mockSearch).toHaveBeenCalledWith(0, "Wingspan", [], [], "25");
		},
		{ timeout: 500 }
	);
});
```

## 🛠 Testing Utilities

### renderWithProviders

Custom render function that wraps components with necessary providers:

```typescript
import { renderWithProviders } from "../../test/test-utils";

// Automatically provides:
// - Redux store
// - React Router
// - Any custom context providers
```

### Mock Functions

```typescript
import { vi } from "vitest";

const mockFunction = vi.fn();
// Use mockFunction in tests

// Check calls
expect(mockFunction).toHaveBeenCalledTimes(1);
expect(mockFunction).toHaveBeenCalledWith("expected", "arguments");
```

## 📋 Testing Checklist

### For Each Component:

- [ ] **Rendering**: Does it render without crashing?
- [ ] **Props**: Does it handle props correctly?
- [ ] **User Interactions**: Click, type, select, etc.
- [ ] **Conditional Rendering**: Different states/props
- [ ] **Accessibility**: Proper roles, labels, aria attributes
- [ ] **Error States**: Handle invalid data gracefully

### For Redux Components:

- [ ] **State Connection**: Reads from Redux correctly
- [ ] **Actions**: Dispatches actions when expected
- [ ] **State Changes**: Responds to state updates
- [ ] **Initial State**: Works with empty/default state

### For Forms:

- [ ] **Validation**: Required fields, format validation
- [ ] **Submission**: Calls correct handlers
- [ ] **Reset/Clear**: Clears form data
- [ ] **Error Handling**: Shows validation errors

## 🎯 Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ✅ Good - tests user-visible behavior
expect(screen.getByText("Welcome")).toBeInTheDocument();

// ❌ Avoid - tests implementation details
expect(component.state.message).toBe("Welcome");
```

### 2. Use Semantic Queries

```typescript
// ✅ Good - accessible and robust
screen.getByRole("button", { name: "Submit" });
screen.getByLabelText("Email address");

// ❌ Avoid - brittle and not accessible
screen.getByClassName("btn-primary");
screen.getByTestId("email-input");
```

### 3. Prefer User Events

```typescript
// ✅ Good - simulates real user behavior
await user.click(button);
await user.type(input, "text");

// ❌ Avoid - doesn't simulate real interactions
fireEvent.click(button);
```

### 4. Use Descriptive Test Names

```typescript
// ✅ Good - clear and descriptive
it("shows error message when email is invalid");
it("disables submit button while form is loading");

// ❌ Avoid - vague or implementation-focused
it("works correctly");
it("calls handleSubmit");
```

## 🔧 Configuration Files

### vitest.config.ts

- Test environment setup (jsdom)
- Test file patterns
- Coverage configuration
- Global test setup

### src/test/setup.ts

- Testing library extensions
- Global mocks (matchMedia, ResizeObserver, etc.)
- Test environment configuration

### src/test/test-utils.tsx

- Custom render function with providers
- Mock data helpers
- Common testing utilities

## 📊 Coverage Reports

Generate coverage reports to see which parts of your code are tested:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory and include:

- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

## 🐛 Debugging Tests

### VS Code Integration

- Install the Vitest extension
- Run tests directly from the editor
- Set breakpoints in test files

### Console Debugging

```typescript
import { screen } from "@testing-library/react";

// Debug what's rendered
screen.debug(); // Prints entire DOM
screen.debug(screen.getByRole("button")); // Prints specific element
```

### Finding Elements

```typescript
// List all available roles
screen.logTestingPlaygroundURL();

// See what's available
console.log(screen.getAllByRole("button"));
```

## 📚 Additional Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Documentation](https://vitest.dev/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [User Event Documentation](https://testing-library.com/docs/user-event/intro/)

---

Happy Testing! 🧪✨
