import React, { useEffect, useState, useRef, useMemo } from "react";
import { Chart, ChartConfiguration, registerables } from "chart.js";
import { useSelector } from "react-redux";
import { UserGame } from "../../redux/userGameReducer";
import { RootState } from "../../redux/store";

const PlayCountGraph: React.FC = () => {
	const [userGamesLabels, setUserGamesLabels] = useState<string[]>([]);
	const [userGamesPlays, setUserGamesPlays] = useState<number[]>([]);
	const [chartInstance, setChartInstance] = useState<Chart<"bar">>();

	const chartContainer = useRef<HTMLCanvasElement | null>(null);
	const userGames: UserGame[] = useSelector(
		(state: RootState) => state.userGameReducer.userGames
	);

	useEffect(() => {
		setUserGamesLabels(userGamesSorter(userGames).userGamesLabels);
		setUserGamesPlays(userGamesSorter(userGames).userGamesPlays);
	}, [userGames]);

	const userGamesSorter = (
		userGames: UserGame[]
	): { userGamesLabels: string[]; userGamesPlays: number[] } => {
		const userGamesSorted: UserGame[] = userGames;

		userGamesSorted.sort((firstEl: UserGame, secondEl: UserGame) => {
			if (firstEl.play_count < secondEl.play_count) {
				return 1;
			}
			if (firstEl.play_count > secondEl.play_count) {
				return -1;
			}
			// a must be equal to b
			return 0;
		});

		const outputMain = userGamesSorted.slice(0, 5);
		const userGamesPlays = outputMain.map((el: UserGame) => {
			return el.play_count ? el.play_count : 0;
		});
		const userGamesLabels = outputMain.map((el: UserGame) => el.name);

		return {
			userGamesPlays,
			userGamesLabels,
		};
	};

	const chartConfig: ChartConfiguration<"bar"> = useMemo(
		() => ({
			type: "bar",
			data: {
				labels: userGamesLabels,
				datasets: [
					{
						label: "Most Played Games",
						data: userGamesPlays,
					},
				],
			},
			options: {
				plugins: {
					legend: {},
				},
			},
		}),
		[userGamesLabels, userGamesPlays]
	);

	useEffect(() => {
		if (chartContainer && chartContainer.current) {
			chartInstance?.destroy();
			Chart.register(...registerables);
			const newChart = new Chart(chartContainer.current, chartConfig);
			setChartInstance(newChart);
		}
	}, [
		chartContainer,
		userGamesLabels,
		userGamesPlays,
		chartConfig,
		chartInstance,
	]);

	return (
		<div>
			<canvas ref={chartContainer} />
		</div>
	);
};

export default PlayCountGraph;
