import { chart, candlestickSeries } from "./createChart";
import { state } from "./chartData";
import { formatToolTip } from "../frontEnd/pageControls";
import { drawTools, updateTools } from "./drawingTools";
import {
	addDataToSymbol,
	coinApi,
	getPastIsoTime,
} from "../controllers/coinApi";

export let lastCrosshairPrice = 0.0;

function waitForChartLoaded(callback) {
	const checkInterval = 500;
	const intervalId = setInterval(() => {
		if (state.chartLoaded) {
			clearInterval(intervalId);
			callback();
		}
	}, checkInterval);
}

function initializeChartEvents() {
	chart
		.timeScale()
		.subscribeVisibleLogicalRangeChange((newVisibleLogicalRange) => {
			if (
				newVisibleLogicalRange.from <= 0 &&
				newVisibleLogicalRange.to <= state.loadLimit &&
				state.chartLoaded == true &&
				state.needMoreData == true
			) {
				state.needMoreData = false;

				let toTime = new Date(state.seriesData.at(0).time * 1000).toISOString();
				let fromTime = getPastIsoTime(
					state.loadLimit,
					coinApi.interval,
					toTime
				);

				addDataToSymbol(fromTime, toTime);
			}
		});

	chart.subscribeCrosshairMove((param) => {
		const validCrosshairPoint = !(
			param === undefined ||
			param.time === undefined ||
			param.point.x < 0 ||
			param.point.y < 0
		);

		if (validCrosshairPoint) {
			lastCrosshairPrice = candlestickSeries.coordinateToPrice(param.point.y);
		}

		formatToolTip(param, validCrosshairPoint);

		updateTools(param);
	});

	chart.subscribeClick((param) => {
		drawTools(param);
	});
}

waitForChartLoaded(() => {
	initializeChartEvents();
});
