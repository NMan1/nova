import { CanvasRenderingTarget2D } from "fancy-canvas";
import {
	Coordinate,
	IChartApi,
	ISeriesApi,
	ISeriesPrimitive,
	ISeriesPrimitiveAxisView,
	ISeriesPrimitivePaneRenderer,
	ISeriesPrimitivePaneView,
	SeriesOptionsMap,
	SeriesType,
	Time,
	MismatchDirection,
	CandlestickData,
} from "lightweight-charts";
import { krakenSocketData } from "../../coinApis/krakenSocket";

class CountdownTimerPaneRenderer implements ISeriesPrimitivePaneRenderer {
	_x: Coordinate | null = null;
	_options: CountdownTimerOptions;
	constructor(x: Coordinate | null, options: CountdownTimerOptions) {
		this._x = x;
		this._options = options;
	}
	draw(target: CanvasRenderingTarget2D) {
		target.useBitmapCoordinateSpace((scope) => {});
	}
}

class CountdownTimerPaneView implements ISeriesPrimitivePaneView {
	_source: CountdownTimer;
	_x: Coordinate | null = null;
	_options: CountdownTimerOptions;

	constructor(source: CountdownTimer, options: CountdownTimerOptions) {
		this._source = source;
		this._options = options;
	}
	update() {
		const timeScale = this._source._chart.timeScale();
	}
	renderer() {
		return new CountdownTimerPaneRenderer(this._x, this._options);
	}
}

class CountdownTimerAxisView implements ISeriesPrimitiveAxisView {
	_source: CountdownTimer;
	_coordinate: Coordinate | null = null; // Coordinate for the last value
	_options: CountdownTimerOptions;

	constructor(source: CountdownTimer, options: CountdownTimerOptions) {
		this._source = source;
		this._options = options;
	}

	update() {
		const lastCandleData = this._source._series.data().at(-1);
		const lastClosePrice =
			lastCandleData != undefined
				? (lastCandleData as CandlestickData).close
				: 0;
		const coordinate = this._source._series.priceToCoordinate(lastClosePrice);

		const fontSize = this._source._chart.options().layout.fontSize || 12; // Default fallback is 12px
		const padding = 2;
		const labelHeight = fontSize + 2 * padding;

		this._coordinate = coordinate
			? ((coordinate + labelHeight) as Coordinate)
			: null;
	}

	visible() {
		return this._options.showLabel;
	}

	tickVisible() {
		return this._options.showLabel;
	}

	coordinate() {
		return this._coordinate ?? 0;
	}

	text() {
		return this._options.timeRemaning;
	}

	textColor() {
		return (
			this._source._series.priceScale().options().textColor ??
			"rgba(255, 255, 255, 1)"
		);
	}

	backColor() {
		return this._source._series.options().priceLineColor;
	}
}

export class CountdownTimer implements ISeriesPrimitive<Time> {
	_chart: IChartApi;
	_series: ISeriesApi<keyof SeriesOptionsMap>;
	_paneViews: CountdownTimerPaneView[];
	_priceAxisViews: CountdownTimerAxisView[];
	_options: CountdownTimerOptions;
	_requestUpdate: (() => void) | null = null; // Store requestUpdate callback

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		options?: Partial<CountdownTimerOptions>
	) {
		this._chart = chart;
		this._series = series;
		this._options = {
			...defaultOptions,
			...options,
		};
		this._paneViews = [new CountdownTimerPaneView(this, this._options)];
		this._priceAxisViews = [new CountdownTimerAxisView(this, this._options)];
	}

	updateAllViews() {
		this._paneViews.forEach((pw) => pw.update());
		this._priceAxisViews.forEach((tw) => tw.update());
	}

	priceAxisViews() {
		return this._priceAxisViews;
	}

	paneViews() {
		return this._paneViews;
	}

	attached({ requestUpdate }: { requestUpdate: () => void }) {
		this._requestUpdate = requestUpdate; // Save the callback
	}

	detached() {
		this._requestUpdate = null;
	}
}

export interface CountdownTimerOptions {
	showLabel: boolean;
	timeRemaning: string;
}

const defaultOptions: CountdownTimerOptions = {
	showLabel: true,
	timeRemaning: "0:00",
};
