import {
	createChart,
	CrosshairMode,
	PriceLineSource,
} from "lightweight-charts";
import { CountdownTimer } from "../plugins/countdowntimer/countdowntimer";
import { state } from "./chartData";
import { krakenSocketData } from "../coinApis/krakenSocket";
import {
	coinApi,
	convertCoinApiIntervalToSeconds,
} from "../controllers/coinApi";

const chartOptions = {
	autoSize: true,
	layout: {
		background: { color: "#17171B" },
		textColor: "#FFFFFF",
		fontSize: 12,
		fontFamily: "Verdana, sans-serif",
	},
	grid: {
		vertLines: {
			color: "#333333", // Vertical grid line color
			style: 0, // Line style: 0=solid, 1=dotted, etc.
			visible: false, // Show/hide vertical lines
		},
		horzLines: {
			color: "#333333", // Horizontal grid line color
			style: 0,
			visible: false,
		},
	},
	rightPriceScale: {
		visible: true,
		borderVisible: true,
		borderColor: "#555555",
		alignLabels: false,
	},
	priceScale: {
		alignLabels: false,
	},
	timeScale: {
		borderColor: "#555555",
		timeVisible: true, // Show/hide time labels
		secondsVisible: false, // Show/hide seconds on timescale
	},
	crosshair: {
		mode: CrosshairMode.Normal,
		horzLine: {
			labelBackgroundColor: "rgba(255, 255, 255, 1)",
		},
	},
	watermark: {
		visible: true,
		fontSize: 24,
		horzAlign: "center",
		vertAlign: "center",
		color: "rgba(255, 255, 255, 0.0)",
		text: "NOVA CHARTS",
	},
};

export const chart = createChart(
	document.getElementById("chart-container"),
	chartOptions
);

export const candlestickSeries = chart.addCandlestickSeries({
	upColor: "#26a69a",
	downColor: "#ef5350",
	borderVisible: false,
	wickUpColor: "#26a69a",
	wickDownColor: "#ef5350",

	lastValueVisible: false,
	priceLineVisible: false,
	priceLineSource: PriceLineSource.LastBar,
});

export let priceLine = candlestickSeries.createPriceLine({
	price: 0,
	color: "red",
	lineWidth: 1,
	axisLabelVisible: true,
});

export function createCountdownTimer() {
	const countdownTimer = new CountdownTimer(chart, candlestickSeries);
	candlestickSeries.attachPrimitive(countdownTimer);

	setInterval(() => {
		if (!state.chartLoaded || state.seriesData.length == 0) {
			return;
		}

		const lastCandleData = state.seriesData.at(-1);

		if (
			lastCandleData &&
			typeof lastCandleData.time === "number" &&
			coinApi.interval
		) {
			const currentTimestamp = Math.floor(new Date().getTime() / 1000);

			const totalIntervalSeconds = convertCoinApiIntervalToSeconds(
				coinApi.interval
			);
			const timeElapsed = currentTimestamp - lastCandleData.time; // Time passed since last candle

			const remainingSeconds = Math.max(totalIntervalSeconds - timeElapsed, 0);

			const hours = Math.floor(remainingSeconds / 3600);
			const minutes = Math.floor((remainingSeconds % 3600) / 60);
			const seconds = remainingSeconds % 60;

			if (hours > 0) {
				// Show hh:mm:ss if interval includes hours or greater
				countdownTimer._options.timeRemaning = `${String(hours).padStart(
					2,
					"0"
				)}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
					2,
					"0"
				)}`;
			} else {
				// Default to mm:ss if no hours
				countdownTimer._options.timeRemaning = `${String(minutes).padStart(
					2,
					"0"
				)}:${String(seconds).padStart(2, "0")}`;
			}

			countdownTimer.updateAllViews();
			if (countdownTimer._requestUpdate) {
				countdownTimer._requestUpdate();
			}
		} else {
			countdownTimer._options.showLabel = false;
			countdownTimer._options.timeRemaning = "";
		}
	}, 950);
}

createCountdownTimer();
