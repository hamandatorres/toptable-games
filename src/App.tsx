import { useEffect, Suspense, lazy } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "./redux/store";
import axios from "axios";
import "./scss/main.scss";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header/Header";
import { Routes, Route } from "react-router-dom";
import Footer from "./components/Header/footer";

// Lazy load components for better initial bundle size
const User = lazy(() => import("./components/User/User"));
const GameLibrary = lazy(() => import("./components/Games/GameLibrary"));
const Login = lazy(() => import("./components/Header/Login"));
const GameDisplay = lazy(() => import("./components/Games/GameDisplay"));
const MyAccount = lazy(() => import("./components/User/MyAccount"));
const ItemDisplay = lazy(() => import("./components/User/ItemDisplay"));
const ResetPassword = lazy(() => import("./components/User/PasswordReset"));
import type { User as UserType } from "./redux/userReducer";
import { fetchUserGames } from "./redux/userGameReducer";
import { updateUser } from "./redux/userReducer";
import { updateMec, updateCat, updateRatings } from "./redux/meccatReducer";
import type { GameRatings } from "./redux/meccatReducer";
import { MockGameService } from "./services/mockGameData";

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
			const res = await MockGameService.getMechanics();
			const mechanicArr = res.mechanics;
			dispatch(updateMec(mechanicArr));
		} catch (err) {
			console.log(err);
		}
	};

	const getCatagories = async () => {
		try {
			const res = await MockGameService.getCategories();
			const categoryArr = res.categories;
			dispatch(updateCat(categoryArr));
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<div className="App">
			<Header />
			<Suspense
				fallback={
					<div className="loading-container">
						<div className="loading-spinner">Loading...</div>
					</div>
				}
			>
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
			</Suspense>
			<Footer />
		</div>
	);
}

export default App;
