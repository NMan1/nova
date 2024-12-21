import axios from "axios";
import { state } from "../chart/chartData";
import { candlestickSeries } from "../chart/createChart";
import { resetChartScale } from "../frontEnd/pageControls";
import { krakenSocketData } from "./krakenSocket";

export function getPastUnixTime(count, intervalMinutes, fromUnix = null) {
	const currentTimeInSeconds = fromUnix
		? fromUnix
		: Math.floor(Date.now() / 1000);

	const intervalInSeconds = intervalMinutes * 60;
	return currentTimeInSeconds - count * intervalInSeconds;
}

function transformData(dataArray) {
	return dataArray.map(
		([time, open, high, low, close, vwap, volume, count]) => ({
			time,
			open: parseFloat(open),
			high: parseFloat(high),
			low: parseFloat(low),
			close: parseFloat(close),
		})
	);
}

export async function getKrakenHistorical(pair, interval, since) {
	let config = {
		method: "get",
		maxBodyLength: Infinity,
		url: "https://api.kraken.com/0/public/OHLC",
		headers: {
			Accept: "application/json",
		},
		params: {
			pair: pair,
			interval: interval,
			since: since,
		},
	};

	return axios
		.request(config)
		.then((response) => {
			return transformData(response.data.result[pair]);
		})
		.catch((error) => {
			console.log(error);
		});
}

async function fetchTrades(pair, since) {
	const config = {
		method: "get",
		url: "https://api.kraken.com/0/public/Trades",
		params: {
			pair,
			since,
		},
	};

	const response = await axios.request(config);
	const trades = response.data.result[pair]; // Array of trades
	const lastId = response.data.result.last; // ID to use as `since` for the next request
	return { trades, lastId };
}

function aggregateToOHLC(trades, intervalMinutes) {
	const intervalSeconds = intervalMinutes * 60;
	const ohlc = [];
	let currentBar = null;

	trades.forEach((trade) => {
		const [price, volume, timestamp] = trade.map(Number);
		const tradeTime = Math.floor(timestamp); // Convert to whole seconds
		const intervalStart =
			Math.floor(tradeTime / intervalSeconds) * intervalSeconds;

		if (!currentBar || currentBar.time !== intervalStart) {
			// Push the completed bar and start a new one
			if (currentBar) {
				ohlc.push(currentBar);
			}
			currentBar = {
				time: intervalStart,
				open: price,
				high: price,
				low: price,
				close: price,
				volume: 0,
			};
		}

		// Update the current bar
		currentBar.high = Math.max(currentBar.high, price);
		currentBar.low = Math.min(currentBar.low, price);
		currentBar.close = price;
		currentBar.volume += volume;
	});

	// Push the final bar
	if (currentBar) {
		ohlc.push(currentBar);
	}

	return ohlc;
}

export function loadMoreData(count) {
	state.needMoreData = true;

	(async () => {
		console.log("loading", count);

		let reconstructedBars = [];
		let sinceUnix = getPastUnixTime(
			count, // Initial guess for how far back we need to go
			krakenSocketData.interval,
			state.seriesData.at(0).time
		);

		let remainingCount = count;

		while (remainingCount > 0) {
			console.log("loading for unix", sinceUnix);

			// Fetch trades
			const { trades, lastId } = await fetchTrades(
				krakenSocketData.symbols[0],
				sinceUnix
			);

			if (!trades || trades.length === 0) {
				console.warn("No trades returned. Exiting loop.");
				break;
			}

			// Aggregate trades into OHLC bars
			const ohlcData = aggregateToOHLC(trades, krakenSocketData.interval);

			// Append to reconstructedBars
			reconstructedBars = [...ohlcData, ...reconstructedBars];
			remainingCount -= ohlcData.length;

			// If fewer than 1000 trades are returned, we've likely exhausted the data
			if (trades.length < 1000) {
				console.warn("No more historical data available.");
				break;
			}

			// Adjust sinceUnix based on the earliest bar in reconstructedBars
			const earliestBarTime = reconstructedBars[0]?.time;
			if (earliestBarTime && earliestBarTime < sinceUnix) {
				sinceUnix = earliestBarTime - 1; // Go back slightly to ensure no gaps
			} else {
				console.warn(
					"No new data found. Breaking loop to prevent infinite loop."
				);
				break;
			}
		}

		// Truncate to exactly `count` if needed
		console.log("reconstructed count", reconstructedBars.length);
		if (reconstructedBars.length > count) {
			reconstructedBars = reconstructedBars.slice(-count);
			console.log("sliced to", reconstructedBars.length);
		}

		console.log("data", reconstructedBars);
		// state.seriesData.unshift(...reconstructedBars);
		// candlestickSeries.setData(state.seriesData);
		// state.needMoreData = false;
	})();
}
