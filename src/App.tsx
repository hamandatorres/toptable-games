import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "./redux/store";
import axios from "axios";
import "./scss/main.scss";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header/Header";
import { Routes, Route } from "react-router-dom";
import User from "./components/User/User";
import GameLibrary from "./components/Games/GameLibrary";
import Login from "./components/Header/Login";
import GameDisplay from "./components/Games/GameDisplay";
import MyAccount from "./components/User/MyAccount";
import ItemDisplay from "./components/User/ItemDisplay";
import ResetPassword from "./components/User/PasswordReset";
import Footer from "./components/Header/footer";
import type { User as UserType } from "./redux/userReducer";
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
			const res = await axios.get<UserType>("/api/auth/user");
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
			<Routes>
				<Route path="/" element={<GameLibrary />} />
				<Route path="/auth" element={<Login />} />
				<Route path="/user" element={<User />} />
				<Route path="/game/:id" element={<GameDisplay />} />
				<Route path="/game" element={<GameLibrary />} />
				<Route path="/account" element={<MyAccount />} />
				<Route path="/usergame/:id" element={<ItemDisplay />} />
				<Route path="/reset/:token" element={<ResetPassword />} />
			</Routes>
			<Footer />
		</div>
	);
}

export default App;
