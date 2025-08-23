import React, { useState, useEffect } from "react";
import axios from "axios";
import { Player } from "customTypes";

const LeaderBoard: React.FC = () => {
	const [leaders, setLeaders] = useState<Player[]>([]);
	const [firstUsername, setFirstUsername] = useState("");
	const [firstTotal, setFirstTotal] = useState("");
	const [secondUsername, setSecondUsername] = useState("");
	const [secondTotal, setSecondTotal] = useState("");
	const [thirdUsername, setThirdUsername] = useState("");
	const [thirdTotal, setThirdTotal] = useState("");
	const [fourthUsername, setFourthUsername] = useState("");
	const [fourthTotal, setFourthTotal] = useState("");
	const [fifthUsername, setFifthUsername] = useState("");
	const [fifthTotal, setFifthTotal] = useState("");

	useEffect((): void => {
		getLeaderboard();
	}, []);

	useEffect((): void => {
		if (leaders.length > 0) {
			setFirstUsername(leaders[0]?.username || "");
			setFirstTotal(leaders[0]?.total || "");
			setSecondUsername(leaders[1]?.username || "");
			setSecondTotal(leaders[1]?.total || "");
			setThirdUsername(leaders[2]?.username || "");
			setThirdTotal(leaders[2]?.total || "");
			setFourthUsername(leaders[3]?.username || "");
			setFourthTotal(leaders[3]?.total || "");
			setFifthUsername(leaders[4]?.username || "");
			setFifthTotal(leaders[4]?.total || "");
		}
	}, [leaders]);

	const getLeaderboard = async (): Promise<void> => {
		await axios
			.get("/api/player/leaderboard")
			.then((res) => {
				const leaderboardArray = res.data;
				setLeaders(leaderboardArray);
			})
			.catch((err) => console.log(err));
	};

	return (
		<section className="leaderboard">
			<div>
				<h4 className="leaderHeader">Leaderboard</h4>
			</div>
			<div className="columns">
				<h5>user</h5>
				<h5>total</h5>
			</div>
			<div className="users">
				<div className="leaderRow">
					<div className="position">
						<div className="medal medal-gold">🥇</div>
						<p>{firstUsername}</p>
					</div>
					<p>{firstTotal}</p>
				</div>
				<div className="leaderRow">
					<div className="position">
						<div className="medal medal-silver">🥈</div>
						<p>{secondUsername}</p>
					</div>
					<p>{secondTotal}</p>
				</div>
				<div className="leaderRow">
					<div className="position">
						<div className="medal medal-bronze">🥉</div>
						<p>{thirdUsername}</p>
					</div>
					<p>{thirdTotal}</p>
				</div>
				<div className="leaderRow">
					<div className="position">
						<div className="medal medal-fourth">4</div>
						<p>{fourthUsername}</p>
					</div>
					<p>{fourthTotal}</p>
				</div>
				<div className="leaderRow">
					<div className="position">
						<div className="medal medal-fifth">5</div>
						<p>{fifthUsername}</p>
					</div>
					<p>{fifthTotal}</p>
				</div>
			</div>
			<div className="boardScoreWrapper">
				<p className="userDataP"></p>
			</div>
		</section>
	);
};
export default LeaderBoard;
