import { SearchProps, Option } from "customTypes";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Button from "../StyledComponents/Button";

const SearchBar: React.FC<SearchProps> = (props: SearchProps) => {
	const [searchEntry, setSearchEntry] = useState("");
	const [mechanicsSelections, setMechanicsSelections] = useState<string[]>([]);
	const [categoriesSelections, setCategoriesSelections] = useState<string[]>(
		[]
	);
	const [mechanicsCheckboxes, setMechanicsCheckboxes] =
		useState<React.ReactElement[]>();
	const [categoriesCheckboxes, setCategoriesCheckboxes] =
		useState<React.ReactElement[]>();
	const [itemsPerPage, setItemsPerPage] = useState<string>("25");
	const [currentPage, setCurrentPage] = useState(0);
	const [scrollTrigger, setScrollTrigger] = useState(false);

	const mechanics = useSelector(
		(state: RootState) => state.meccatReducer.mechanic
	);
	const categories = useSelector(
		(state: RootState) => state.meccatReducer.category
	);
	const rating = useSelector((state: RootState) => state.meccatReducer.rating);

	// Destructure props to avoid dependency issues
	const { getAPIGames } = props;

	const checkToggler = (type: string, value: string) => {
		switch (type) {
			case "mechanics":
				setMechanicsSelections((prev) => {
					const arraySearch = prev.indexOf(value);
					if (arraySearch === -1) {
						return [...prev, value];
					} else {
						return prev.filter((item) => item !== value);
					}
				});
				break;
			case "category":
				setCategoriesSelections((prev) => {
					const arraySearch = prev.indexOf(value);
					if (arraySearch === -1) {
						return [...prev, value];
					} else {
						return prev.filter((item) => item !== value);
					}
				});
				break;
			default:
				break;
		}
	};

	const mechanicsCheckboxMaker = useCallback(() => {
		const output = mechanics.map((option: Option) => {
			return (
				<div className="checkboxDiv" key={`div${option.id}`}>
					<input
						type="checkbox"
						id={option.id}
						value={option.id}
						checked={mechanicsSelections.includes(option.id)}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							checkToggler("mechanics", e.target.value);
						}}
					></input>
					<label className="checkLabel" htmlFor={option.id}>
						{option.name}
					</label>
				</div>
			);
		});
		setMechanicsCheckboxes(output);
	}, [mechanics, mechanicsSelections]);

	const categoriesCheckboxMaker = useCallback(() => {
		const output = categories.map((option: Option) => {
			return (
				<div className="checkboxDiv" key={`div${option.id}`}>
					<input
						type="checkbox"
						id={option.id}
						value={option.id}
						checked={categoriesSelections.includes(option.id)}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							checkToggler("category", e.target.value);
						}}
					></input>
					<label className="checkLabel" htmlFor={option.id}>
						{option.name}
					</label>
				</div>
			);
		});
		setCategoriesCheckboxes(output);
	}, [categories, categoriesSelections]);

	useEffect(() => {
		mechanicsCheckboxMaker();
	}, [mechanicsCheckboxMaker]);

	useEffect(() => {
		categoriesCheckboxMaker();
	}, [categoriesCheckboxMaker]);

	useEffect(() => {
		getAPIGames(
			currentPage,
			searchEntry,
			mechanicsSelections,
			categoriesSelections,
			itemsPerPage
		);
	}, [
		itemsPerPage,
		currentPage,
		rating,
		getAPIGames,
		searchEntry,
		mechanicsSelections,
		categoriesSelections,
	]);

	// Separate useEffect for filter changes with debouncing
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			getAPIGames(
				currentPage,
				searchEntry,
				mechanicsSelections,
				categoriesSelections,
				itemsPerPage
			);
		}, 300); // 300ms debounce

		return () => clearTimeout(timeoutId);
	}, [
		mechanicsSelections,
		categoriesSelections,
		currentPage,
		itemsPerPage,
		searchEntry,
		getAPIGames,
	]);

	const trackScroll: () => void = () => {
		if (window.scrollY > 900) {
			setScrollTrigger(true);
		} else {
			setScrollTrigger(false);
		}
	};

	useEffect(() => {
		document.addEventListener("scroll", trackScroll);
		return () => document.removeEventListener("scroll", trackScroll);
	});

	const uncheckCheckboxes = () => {
		setSearchEntry("");
		setMechanicsSelections([]);
		setCategoriesSelections([]);
	};

	return (
		<aside id="searchComponentContainer">
			<form
				id="searchForm"
				onSubmit={(e: React.SyntheticEvent) => {
					e.preventDefault();
				}}
			>
				<label
					id="titleDescriptionSearchLabel"
					htmlFor="titleDescriptionSearch"
				>
					Search
				</label>
				<input
					id="titleDescriptionSearch"
					type="text"
					value={searchEntry}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setSearchEntry(e.target.value)
					}
					placeholder="game title"
				></input>
				<div id="searchButtonContainer">
					<Button
						onClick={() => {
							getAPIGames(
								currentPage,
								searchEntry,
								mechanicsSelections,
								categoriesSelections,
								itemsPerPage
							);
							setSearchEntry("");
						}}
					>
						Search
					</Button>
					<Button
						onClick={() => {
							uncheckCheckboxes();
							getAPIGames(0, "", [], [], itemsPerPage);
							setCurrentPage(0);
						}}
					>
						Clear
					</Button>
				</div>
				<label htmlFor="itemsPerPageSelector">Items per page:</label>
				<select
					id="itemsPerPageSelector"
					title="Select number of results per page"
					onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
						setItemsPerPage(e.target.value);
					}}
					value={itemsPerPage}
				>
					<option value="25">25</option>
					<option value="50">50</option>
					<option value="75">75</option>
					<option value="100">100</option>
				</select>
			</form>
			<div id="checkboxContainer">
				<div id="checkboxSubContainer">
					<section className="mecCatContainer">
						<h6> Mechanics</h6>
						<form className="mecCatCheckboxes">{mechanicsCheckboxes}</form>
					</section>
					<section className="mecCatContainer">
						<h6> Categories</h6>
						<form className="mecCatCheckboxes">{categoriesCheckboxes}</form>
					</section>
				</div>
				<div
					className={scrollTrigger ? "stickyArrows" : "noStickyArrows"}
					id="arrowBox"
				>
					<svg
						className={scrollTrigger ? "pageArrowS" : "pageArrowNS"}
						onClick={() =>
							currentPage > 0 ? setCurrentPage(currentPage - 1) : null
						}
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
					>
						<path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />
					</svg>
					<div id="currentPageIndicator">
						Current Page = <strong>{currentPage + 1}</strong>
					</div>
					<svg
						className={scrollTrigger ? "pageArrowS" : "pageArrowNS"}
						onClick={() => setCurrentPage(currentPage + 1)}
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
					>
						<path d="M7.33 24l-2.83-2.829 9.339-9.175-9.339-9.167 2.83-2.829 12.17 11.996z" />
					</svg>
				</div>
			</div>
		</aside>
	);
};

export default SearchBar;
