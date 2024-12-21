import { chart, candlestickSeries } from "./createChart";
import { state } from "./chartData";
import { formatToolTip } from "../frontEnd/pageControls";
import { drawTools, updateTools } from "./drawingTools";
import { loadMoreData } from "../coinApis/krakenRest";

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
			if (newVisibleLogicalRange.from <= 0 && state.needMoreData === false) {
				// loadMoreData(newVisibleLogicalRange.to - newVisibleLogicalRange.from);
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
