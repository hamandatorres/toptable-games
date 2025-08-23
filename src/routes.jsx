import React from "react";
import { Routes, Route } from "react-router-dom";
import User from "./components/User/User";
import GameLibrary from "./components/Games/GameLibrary";
import Login from "./components/Header/Login";
import GameDisplay from "./components/Games/GameDisplay";
import MyAccount from "./components/User/MyAccount";
import ItemDisplay from "./components/User/ItemDisplay";
import ResetPassword from "./components/User/PasswordReset";

export default function AppRoutes() {
	return (
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
	);
}
