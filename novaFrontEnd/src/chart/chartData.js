import { candlestickSeries, priceLine } from "./createChart";

export let state = {
	chartLoaded: true,
	loadLimit: 300,
	needMoreData: true,
	seriesData: [],
};

export function updateChartData(data) {
	const candleData = {
		time: Math.floor(new Date(data.time_open).getTime() / 1000),
		open: data.price_open,
		high: data.price_high,
		low: data.price_low,
		close: data.price_close,
	};

	const lastCandle = state.seriesData[state.seriesData.length - 1];
	const lastCandleTimeDif = lastCandle
		? (candleData.time - lastCandle.time) / 60
		: data.interval;

	if (lastCandle && lastCandleTimeDif < data.interval) {
		lastCandle.open = candleData.open;
		lastCandle.high = candleData.high;
		lastCandle.low = candleData.low;
		lastCandle.close = candleData.close;
	} else {
		state.seriesData.unshift(candleData);
	}

	candlestickSeries.setData(state.seriesData);

	priceLine.applyOptions({
		price: state.seriesData.at(-1).close,
		color:
			state.seriesData.at(-1).close > state.seriesData.at(-1).open
				? candlestickSeries.options().upColor
				: candlestickSeries.options().downColor,
	});

	candlestickSeries.applyOptions({
		priceLineColor: priceLine.options().color,
	});
}
