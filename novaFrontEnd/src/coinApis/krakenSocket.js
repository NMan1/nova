import { state, updateChartData } from "../chart/chartData";
import { candlestickSeries } from "../chart/createChart";
import { resetChartScale } from "../frontEnd/pageControls";
import { getKrakenHistorical, getPastUnixTime } from "./krakenRest";

const krakenWs = new WebSocket("wss://ws.kraken.com/v2");
export let krakenSocketData = {
	symbols: ["BTC/USD"],
	interval: 60,
	activeSubscription: {},
};

krakenWs.addEventListener("open", () => {
	console.log("[kraken] socket connection opened");
	// krakenSocketData.activeSubscription = {
	// 	method: "subscribe",
	// 	params: {
	// 		channel: "ohlc",
	// 		symbol: krakenSocketData.symbols,
	// 		interval: krakenSocketData.interval,
	// 	},
	// };

	// krakenWs.send(JSON.stringify(krakenSocketData.activeSubscription));

	// setInterval(() => {
	// 	krakenWs.send(JSON.stringify({ method: "ping" }));
	// 	console.log("[kraken] ping sent");
	// }, 59000);
});

krakenWs.addEventListener("message", (event) => {
	const data = JSON.parse(event.data);

	if (data.channel === "ohlc" && data.type === "update") {
		updateChartData(data.data[0]);
	} else if (data.channel === "ohlc" && data.type === "snapshot") {
		data.data.forEach((candleData) => {
			updateChartData(candleData);
		});

		(async () => {
			let sinceUnix = getPastUnixTime(720, krakenSocketData.interval);
			let ohlcHistorical = await getKrakenHistorical(
				krakenSocketData.symbols[0],
				krakenSocketData.interval,
				sinceUnix
			);

			ohlcHistorical = ohlcHistorical.splice(
				0,
				ohlcHistorical.length - data.data.length
			);

			console.log("last", ohlcHistorical.at(0));

			state.seriesData.unshift(...ohlcHistorical);

			console.log("data size", state.seriesData.length);

			candlestickSeries.setData(state.seriesData);
			state.chartLoaded = true;
			resetChartScale();
		})();
	} else if (data.method === "subscribe" && data.success == true) {
		console.log(
			`[kraken] subscribed to ${data.result.symbol} ${data.result.interval}min`
		);

		krakenSocketData.activeSubscription = {
			method: "subscribe",
			params: {
				channel: "ohlc",
				symbol: krakenSocketData.symbols,
				interval: krakenSocketData.interval,
			},
		};
	} else if (data.method === "unsubscribe") {
		console.log(
			`[kraken] unsubscribed from ${data.result.symbol} ${data.result.interval}min`
		);
	} else if (data.channel === "status" && data.type === "update") {
		if (data.data[0].system === "online") {
		}
	}
});

krakenWs.addEventListener("error", (error) => {
	console.error("[kraken] socket Error:", error);
});

krakenWs.addEventListener("close", () => {
	console.log("[kraken] socket closed");
});

export function updateSubscription() {
	console.log(
		`[kraken] Updating subcription to ${krakenSocketData.symbols} ${krakenSocketData.interval}min`
	);

	state.chartLoaded = false;
	state.seriesData = [];

	krakenWs.send(
		JSON.stringify({
			method: "unsubscribe",
			params: {
				channel: krakenSocketData.activeSubscription.params.channel,
				symbol: krakenSocketData.activeSubscription.params.symbol,
				interval: krakenSocketData.activeSubscription.params.interval,
			},
		})
	);

	krakenWs.send(
		JSON.stringify({
			method: "subscribe",
			params: {
				channel: "ohlc",
				symbol: krakenSocketData.symbols,
				interval: krakenSocketData.interval,
			},
		})
	);
}

setTimeout(() => {
	window.addEventListener("beforeunload", () => {
		if (krakenWs.readyState === WebSocket.OPEN) {
			console.log("[kraken] refreshed, closing connections");
			krakenWs.send(
				JSON.stringify({
					method: "unsubscribe",
					params: {
						channel: krakenSocketData.activeSubscription.params.channel,
						symbol: krakenSocketData.activeSubscription.params.symbol,
						interval: krakenSocketData.activeSubscription.params.interval,
					},
				})
			);
			krakenWs.close();
		}
	});
}, 1000);
