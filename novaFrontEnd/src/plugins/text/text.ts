import {
	BitmapCoordinatesRenderingScope,
	CanvasRenderingTarget2D,
} from "fancy-canvas";
import {
	AutoscaleInfo,
	Coordinate,
	IChartApi,
	ISeriesApi,
	ISeriesPrimitive,
	ISeriesPrimitivePaneRenderer,
	ISeriesPrimitivePaneView,
	Logical,
	SeriesOptionsMap,
	SeriesType,
	Time,
} from "lightweight-charts";

class TextPaneRenderer implements ISeriesPrimitivePaneRenderer {
	_p1: ViewPoint;
	_text: string;
	_options: TextDrawOptions;

	constructor(p1: ViewPoint, text: string, options: TextDrawOptions) {
		this._p1 = p1;
		this._text = text;
		this._options = options;
	}

	draw(target: CanvasRenderingTarget2D) {
		target.useBitmapCoordinateSpace((scope) => {
			if (this._p1.x === null || this._p1.y === null) return;
			const ctx = scope.context;
			const x1Scaled = Math.round(this._p1.x * scope.horizontalPixelRatio);
			const y1Scaled = Math.round(this._p1.y * scope.verticalPixelRatio);
			this._drawTextLabel(scope, this._text, x1Scaled, y1Scaled);
		});
	}

	_drawTextLabel(
		scope: BitmapCoordinatesRenderingScope,
		text: string,
		x: number,
		y: number
	) {
		scope.context.font = this._options.font;

		const offset = 5 * scope.horizontalPixelRatio;
		const textWidth = scope.context.measureText(text).width;
		const leftAdjustment = -textWidth / 2 + offset * 4;

		scope.context.beginPath();
		scope.context.fillStyle = this._options.textColor;
		scope.context.fillText(
			text,
			x - textWidth / 2,
			y + this._options.lineHeight / 2
		);
	}
}

interface ViewPoint {
	x: Coordinate | null;
	y: Coordinate | null;
}

class TextPaneView implements ISeriesPrimitivePaneView {
	_source: TextDraw;
	_p1: ViewPoint = { x: null, y: null };

	constructor(source: TextDraw) {
		this._source = source;
	}

	update() {
		const series = this._source._series;
		const y1 = series.priceToCoordinate(this._source._p1.price);
		const timeScale = this._source._chart.timeScale();
		const x1 = timeScale.timeToCoordinate(this._source._p1.time);
		this._p1 = { x: x1, y: y1 };
	}

	renderer() {
		return new TextPaneRenderer(
			this._p1,
			this._source._options.text,
			this._source._options
		);
	}
}

interface Point {
	time: Time;
	price: number;
}

export interface TextDrawOptions {
	text: string;
	textColor: string;
	lineHeight: number;
	font: string;
}

export class TextDraw implements ISeriesPrimitive<Time> {
	_chart: IChartApi;
	_series: ISeriesApi<keyof SeriesOptionsMap>;
	_p1: Point;
	_paneViews: TextPaneView[];
	_options: TextDrawOptions;
	_minPrice: number;
	_maxPrice: number;
	_requestUpdate: (() => void) | null = null; // Store requestUpdate callback

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		p1: Point,
		options: TextDrawOptions
	) {
		this._chart = chart;
		this._series = series;
		this._p1 = p1;
		this._minPrice = this._p1.price;
		this._maxPrice = this._p1.price;
		(this._options = options), (this._paneViews = [new TextPaneView(this)]);
	}

	autoscaleInfo(
		startTimePoint: Logical,
		endTimePoint: Logical
	): AutoscaleInfo | null {
		const p1Index = this._pointIndex(this._p1);
		if (p1Index === null) return null;
		if (endTimePoint < p1Index) return null;
		return {
			priceRange: {
				minValue: this._minPrice,
				maxValue: this._maxPrice,
			},
		};
	}

	updateAllViews() {
		this._paneViews.forEach((pw) => pw.update());
	}

	paneViews() {
		return this._paneViews;
	}

	_pointIndex(p: Point): number | null {
		const coordinate = this._chart.timeScale().timeToCoordinate(p.time);
		if (coordinate === null) return null;
		const index = this._chart.timeScale().coordinateToLogical(coordinate);
		return index;
	}

	attached({ requestUpdate }: { requestUpdate: () => void }) {
		this._requestUpdate = requestUpdate; // Save the callback
	}
}
