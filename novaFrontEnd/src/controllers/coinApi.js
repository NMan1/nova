import $ from "jquery";
import axios from "axios";
import { serverurl } from "./auth";
import { state, updateChartData } from "../chart/chartData";
import { resetChartScale } from "../frontEnd/pageControls";

export let coinApi = {
	symbols: ["BTC/USD"],
	interval: "15MIN",
	activeSubscription: {},
};

function searchSymbols(searchInput) {
	return axios
		.get(serverurl + "/api/coins/searchSymbols", {
			params: { filterAssetId: searchInput },
		})
		.then((response) => {
			return response.data;
		})
		.catch((error) => {
			console.error("Error fetching symbols:", error);
			return [];
		});
}

function getHistoricalData(symbolId, timeFrame, timeStart, timeEnd, limit) {
	return axios
		.get(serverurl + "/api/coins/symbolHistory", {
			params: {
				symbolId: symbolId,
				period_id: timeFrame,
				timeStart: timeStart,
				timeEnd: timeEnd,
				limit: limit,
			},
		})
		.then((response) => {
			return response.data;
		})
		.catch((error) => {
			console.error("Error fetching symbol history:", error);
			return [];
		});
}

export async function addDataToSymbol(fromTime, toTime) {
	state.chartLoaded = false;

	let symbolId = $("#search-symbol").data("symbol_id");

	let historicalData = await getHistoricalData(
		symbolId,
		coinApi.interval,
		fromTime,
		toTime,
		state.loadLimit
	);

	console.log("Loading", historicalData.length);

	historicalData = historicalData.reverse();
	historicalData.forEach((data) => {
		updateChartData(data);
	});

	state.chartLoaded = true;

	setTimeout(() => {
		state.needMoreData = true;
	}, 3000);
}

export async function loadSymbol() {
	state.chartLoaded = false;
	state.seriesData = [];

	let symbolId = "";
	if (this !== undefined) {
		const pair = $(this).data("pair");
		symbolId = $(this).data("symbol_id");

		$("#search-symbol").text(pair);
		$("#search-symbol").data("symbol_id", symbolId);
		$("#search-wrapper-close").trigger("click");
	} else {
		symbolId = $("#search-symbol").data("symbol_id");
	}

	const toTime = new Date().toISOString();
	const fromTime = getPastIsoTime(state.loadLimit, coinApi.interval, toTime);

	let historicalData = await getHistoricalData(
		symbolId,
		coinApi.interval,
		fromTime,
		toTime,
		state.loadLimit
	);

	const futureTime = getFutureIsoTime(100, coinApi.interval, toTime);
	const whitespaceData = generateWhitespaceData(
		toTime,
		futureTime,
		coinApi.interval
	);

	historicalData.push(...whitespaceData);
	console.log(
		historicalData.at(0),
		historicalData.at(299),
		historicalData.at(300),
		historicalData.at(-1)
	);

	historicalData = historicalData.reverse();
	historicalData.forEach((data) => {
		updateChartData(data);
	});

	resetChartScale();
	state.chartLoaded = true;
}

$(() => {
	$("#search-form").on("submit", async (event) => {
		event.preventDefault();

		const searchInput = $("#search-input").val();
		const symbols_icons = await searchSymbols(searchInput);
		const symbols = symbols_icons[0];
		const icons = symbols_icons[1];

		if (symbols) {
			const searchList = $("#search-list");
			searchList.html("");

			symbols.forEach((symbol) => {
				const pair = `${symbol.asset_id_base}/${symbol.asset_id_quote}`;
				const exchange = symbol.exchange_id;
				const symbolType = symbol.symbol_type;
				const price = symbol.price ?? 0;
				const precision = symbol.price_precision;
				const formattedPrice =
					precision !== undefined ? formatPrice(price, precision) : price;
				const symbolIcon = icons.find(
					(icon) => icon.asset_id === symbol.asset_id_base
				);
				const symbolIconUrl = symbolIcon?.url || "";

				const listElement = $(`
					<li class="search-item">
						<div class="search-item-content">
							<div class="symbol-pair"><img class="symbolImg" src=${symbolIconUrl}><div class="pair-name">${pair}</div></div>
							<div class="exchange-info">${exchange} ${symbolType}</div>
							<div class="price-info">${formattedPrice}(${symbol.asset_id_quote})</div>
						</div>
					</li>
				`);
				searchList.append(listElement);

				listElement.data("symbol_id", symbol.symbol_id);
				listElement.data("pair", pair);
				listElement.on("click", loadSymbol);
			});
		}
	});
});

function formatPrice(price, precision) {
	const decimalPlaces = getPrecisionDigits(precision);
	return price.toLocaleString("en-US", {
		minimumFractionDigits: decimalPlaces,
		maximumFractionDigits: decimalPlaces,
	});
}

// Helper function to determine the number of decimal places from price_precision
function getPrecisionDigits(precision) {
	if (typeof precision === "number" && precision.toExponential) {
		const exponentialMatch = precision.toExponential().match(/e-(\d+)/);
		if (exponentialMatch) {
			return parseInt(exponentialMatch[1], 10); // Extract the number of decimal places
		}
	}
	return precision.toString().split(".")[1]?.length || 0;
}

export function getPastIsoTime(count, coinApiInterval, fromISO = null) {
	const currentTimeInSeconds = fromISO
		? Math.floor(new Date(fromISO).getTime() / 1000)
		: Math.floor(Date.now() / 1000);

	const intervalInSeconds = convertCoinApiIntervalToSeconds(coinApiInterval);

	const pastTimeInSeconds = currentTimeInSeconds - count * intervalInSeconds;

	const pastTimeIso = new Date(pastTimeInSeconds * 1000).toISOString();

	return pastTimeIso;
}

export function getFutureIsoTime(count, coinApiInterval, fromISO = null) {
	const currentTimeInSeconds = fromISO
		? Math.floor(new Date(fromISO).getTime() / 1000)
		: Math.floor(Date.now() / 1000);

	const intervalInSeconds = convertCoinApiIntervalToSeconds(coinApiInterval);

	const pastTimeInSeconds = currentTimeInSeconds + count * intervalInSeconds;

	const pastTimeIso = new Date(pastTimeInSeconds * 1000).toISOString();

	return pastTimeIso;
}

export function convertCoinApiIntervalToSeconds(coinApiInterval) {
	const match = coinApiInterval.match(/^(\d+)([A-Z]+)$/); // Regex to parse interval
	if (!match) {
		throw new Error("Invalid CoinAPI interval format");
	}

	const value = parseInt(match[1], 10); // Numeric part of the interval
	const unit = match[2]; // Unit part of the interval

	switch (unit) {
		case "SEC":
			return value; // Seconds are already in seconds
		case "MIN":
			return value * 60; // Convert minutes to seconds
		case "HRS":
			return value * 60 * 60; // Convert hours to seconds
		case "DAY":
			return value * 24 * 60 * 60; // Convert days to seconds
		case "MTH":
			return value * 30 * 24 * 60 * 60; // Approximate months (30 days)
		case "YRS":
			return value * 365 * 24 * 60 * 60; // Approximate years (365 days)
		default:
			throw new Error("Unsupported time unit in CoinAPI interval");
	}
}

export function generateWhitespaceData(toTime, futureTime, interval) {
	const toDate = new Date(toTime);
	const futureDate = new Date(futureTime);
	const intervalMs = convertCoinApiIntervalToSeconds(interval) * 1000;
	const whitespaceData = [];

	for (
		let currentTime = toDate.getTime();
		currentTime < futureDate.getTime();
		currentTime += intervalMs
	) {
		whitespaceData.push({
			time_open: new Date(currentTime).toISOString(),
		});
	}

	return whitespaceData;
}
