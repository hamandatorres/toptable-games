import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "./redux/store";
import axios from "axios";
import "./scss/main.scss";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header/Header";
// import routes from "./routes.jsx";
import Footer from "./components/Header/footer";
import type { User } from "./redux/userReducer";
import { fetchUserGames } from "./redux/userGameReducer";
import { updateUser } from "./redux/userReducer";
import { updateMec, updateCat, updateRatings } from "./redux/meccatReducer";
import type { GameRatings } from "./redux/meccatReducer";

function App() {
	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		getMechanics();
		getCatagories();
		getUser();
		getGameRatings();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const getGameRatings = async () => {
		try {
			const res = await axios.get("/api/game/ratings");
			const ratingsArray: GameRatings = res.data;
			dispatch(updateRatings(ratingsArray));
		} catch (err) {
			console.log(err);
		}
	};

	const getUser = async () => {
		try {
			const res = await axios.get<User>("/api/auth/user");
			const user = res.data;
			dispatch(fetchUserGames());
			dispatch(updateUser(user));
		} catch (err) {
			console.log(err);
		}
	};

	const getMechanics = async () => {
		try {
			const res = await axios.get(
				`https://api.boardgameatlas.com/api/game/mechanics?client_id=${
					import.meta.env.VITE_CLIENT_ID
				}`
			);
			const mechanicArr = res.data.mechanics;
			dispatch(updateMec(mechanicArr));
		} catch (err) {
			console.log(err);
		}
	};

	const getCatagories = async () => {
		try {
			const res = await axios.get(
				`https://api.boardgameatlas.com/api/game/categories?client_id=${
					import.meta.env.VITE_CLIENT_ID
				}`
			);
			const categoryArr = res.data.categories;
			dispatch(updateCat(categoryArr));
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<div className="App">
			<Header />
			{/* Render the routes */}
			{/* {routes} */}
			<div>
				<h1>Board Game Project</h1>
				<p>Header and Footer components are working!</p>
			</div>
			<Footer />
		</div>
	);
}

export default App;
