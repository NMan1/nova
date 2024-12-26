import axios from "axios";
import JSONStream from "JSONStream";

const apiKey = "7a7865f2-93ee-4740-8f95-85702ea4ff81";

let cachedSymbolSearch = [];
let cachedSymbolHistory = [];
let cachedIcons = [];

async function fetchSymbolIcons(filterAssetId) {
	try {
		const response = await axios({
			method: "get",
			url: "https://rest.coinapi.io/v1/assets/icons/32",
			headers: { "X-CoinAPI-Key": apiKey },
			responseType: "stream",
		});

		if (!cachedIcons || cachedIcons.length === 0) {
			await new Promise((resolve, reject) => {
				const stream = response.data
					.pipe(JSONStream.parse("*"))
					.on("data", (data) => {
						cachedIcons.push(data);
					})
					.on("end", () => {
						console.log("cached icons");
						resolve(cachedIcons);
					})
					.on("error", (err) => {
						console.error("Error processing JSON stream:", err);
						reject(err);
					});

				stream.on("close", () => {
					resolve(cachedIcons);
				});
			});
		}

		let filteredIcons = cachedIcons.filter((icon) =>
			icon.asset_id.includes(filterAssetId)
		);

		return filteredIcons;
	} catch (error) {
		console.error("Error fetching icons:", error);
		return [];
	}
}

async function fetchSymbolBySearch(filterAssetId) {
	try {
		const response = await axios({
			method: "get",
			url: "https://rest.coinapi.io/v1/symbols",
			params: {
				filter_exchange_id: "BINANCE,COINBASE,CRYPTOCOM,KRAKEN",
			},
			headers: { "X-CoinAPI-Key": apiKey },
			responseType: "stream",
		});

		if (!cachedSymbolSearch || cachedSymbolSearch.length === 0) {
			await new Promise((resolve, reject) => {
				const stream = response.data
					.pipe(JSONStream.parse("*"))
					.on("data", (data) => {
						cachedSymbolSearch.push(data);
					})
					.on("end", () => {
						console.log("cached symbols");
						resolve(cachedSymbolSearch);
					})
					.on("error", (err) => {
						console.error("Error processing JSON stream:", err);
						reject(err);
					});

				stream.on("close", () => {
					resolve(cachedSymbolSearch);
				});
			});
		}

		let filteredSymbols = cachedSymbolSearch.filter((symbol) =>
			symbol.asset_id_base.includes(filterAssetId)
		);

		return filteredSymbols;
	} catch (error) {
		console.error("Error fetching symbols:", error);
		return [];
	}
}

async function fetchSymbolHistory(
	symbolId,
	periodId,
	timeStart,
	timeEnd,
	limit
) {
	try {
		const response = await axios({
			method: "get",
			url: `https://rest.coinapi.io/v1/ohlcv/${symbolId}/history`,
			params: {
				period_id: periodId,
				time_start: timeStart,
				time_end: timeEnd,
				limit: limit,
			},
			headers: { "X-CoinAPI-Key": apiKey },
			responseType: "stream",
		});

		let history = [];
		return new Promise((resolve, reject) => {
			const stream = response.data
				.pipe(JSONStream.parse("*"))
				.on("data", (data) => {
					history.push(data);
				})
				.on("end", () => {
					resolve(history);
				})
				.on("error", (err) => {
					console.error("Error processing JSON stream:", err);
					reject(err);
				});

			stream.on("close", () => {
				resolve(history);
			});
		});
	} catch (error) {
		console.error("Error fetching symbolHistory:", error);
		return [];
	}
}

export class CoinApi {
	async searchSymbols(req, res) {
		let { filterAssetId } = req.query;
		try {
			const symbols = await fetchSymbolBySearch(filterAssetId);
			const icons = await fetchSymbolIcons(filterAssetId);
			return res.json([symbols, icons]);
		} catch (error) {
			console.error("Error in searchSymbols:", error);
			return res.status(500).json({ error: "Failed to fetch symbols" });
		}
	}

	async symbolHistory(req, res) {
		let { symbolId, period_id, timeStart, timeEnd, limit } = req.query;
		try {
			const symbolHistory = await fetchSymbolHistory(
				symbolId,
				period_id,
				timeStart,
				timeEnd,
				limit
			);

			return res.json(symbolHistory);
		} catch (error) {
			console.error("Error in symbolHistory:", error);
			return res.status(500).json({ error: "Failed to fetch symbolHistory" });
		}
	}
}
