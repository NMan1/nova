import {
	CanvasRenderingTarget2D,
	BitmapCoordinatesRenderingScope,
} from "fancy-canvas";
import {
	Coordinate,
	IChartApi,
	ISeriesApi,
	ISeriesPrimitive,
	ISeriesPrimitivePaneRenderer,
	ISeriesPrimitivePaneView,
	Time,
	SeriesType,
} from "lightweight-charts";

interface FibonacciOptions {
	levels: number[]; // Fibonacci levels
	lineColor: string;
	lineWidth: number;
	labelTextColor: string;
	labelBackgroundColor: string;
	fontSize: number;
	showLabels: boolean;
}

const defaultFibonacciOptions: FibonacciOptions = {
	levels: [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1],
	lineColor: "rgba(255, 255, 255, 1)",
	lineWidth: 1,
	labelTextColor: "rgba(255, 255, 255, 1)",
	labelBackgroundColor: "rgba(255, 255, 255, 0.25)",
	fontSize: 22,
	showLabels: true,
};

interface Point {
	time: Time;
	price: number;
}

class FibonacciPaneRenderer implements ISeriesPrimitivePaneRenderer {
	_p1: ViewPoint;
	_p2: ViewPoint;
	_options: FibonacciOptions;

	constructor(p1: ViewPoint, p2: ViewPoint, options: FibonacciOptions) {
		this._p1 = p1;
		this._p2 = p2;
		this._options = options;
	}

	draw(target: CanvasRenderingTarget2D) {
		target.useBitmapCoordinateSpace((scope) => {
			if (
				this._p1.x === null ||
				this._p1.y === null ||
				this._p2.x === null ||
				this._p2.y === null
			)
				return;

			const ctx = scope.context;
			const minY = Math.min(this._p1.y, this._p2.y);
			const maxY = Math.max(this._p1.y, this._p2.y);
			const height = maxY - minY;

			this._options.levels.forEach((level) => {
				const levelY = minY + height * (1 - level);
				ctx.beginPath();
				ctx.lineWidth = this._options.lineWidth;
				ctx.strokeStyle = this._options.lineColor;

				if (this._p1.x !== null && this._p2.x !== null) {
					ctx.moveTo(
						this._p1.x * scope.horizontalPixelRatio,
						levelY * scope.verticalPixelRatio
					);
					ctx.lineTo(
						this._p2.x * scope.horizontalPixelRatio,
						levelY * scope.verticalPixelRatio
					);
					ctx.stroke();
				}

				if (this._options.showLabels) {
					if (this._p1.x !== null && this._p2.x !== null) {
						this._drawLabel(ctx, scope, level, this._p1.x, this._p2.x, levelY);
					}
				}
			});
		});
	}

	private _drawLabel(
		ctx: CanvasRenderingContext2D,
		scope: BitmapCoordinatesRenderingScope,
		level: number,
		x1: number,
		x2: number,
		y: number
	) {
		const padding = 4;
		// const label = `${(level * 100).toFixed(1)}%`;
		const label = `${level}`;
		const labelX = x2 * scope.horizontalPixelRatio + padding * 2; // Right of the second point
		const labelY =
			y * scope.verticalPixelRatio + this._options.fontSize / 2 - padding * 2;

		ctx.font = `${this._options.fontSize}px Arial`;
		const textWidth = ctx.measureText(label).width;
		const textHeigth = this._options.fontSize;

		ctx.fillStyle = this._options.labelBackgroundColor;
		ctx.fillRect(
			labelX - padding,
			labelY - this._options.fontSize,
			textWidth + padding * 2,
			this._options.fontSize + padding * 2
		);

		// Text
		ctx.fillStyle = this._options.labelTextColor;
		ctx.fillText(label, labelX, labelY);
	}
}

interface ViewPoint {
	x: Coordinate | null;
	y: Coordinate | null;
}

class FibonacciPaneView implements ISeriesPrimitivePaneView {
	private _source: FibonacciTool;
	private _p1: ViewPoint = { x: null, y: null };
	private _p2: ViewPoint = { x: null, y: null };

	constructor(source: FibonacciTool) {
		this._source = source;
	}

	update() {
		const series = this._source.series;
		const y1 = series.priceToCoordinate(this._source.p1.price);
		const y2 = series.priceToCoordinate(this._source.p2.price);
		const timeScale = this._source.chart.timeScale();
		const x1 = timeScale.timeToCoordinate(this._source.p1.time);
		const x2 = timeScale.timeToCoordinate(this._source.p2.time);

		this._p1 = { x: x1, y: y1 };
		this._p2 = { x: x2, y: y2 };
	}

	renderer() {
		return new FibonacciPaneRenderer(this._p1, this._p2, this._source.options);
	}
}

export class FibonacciTool implements ISeriesPrimitive<Time> {
	private _chart: IChartApi;
	private _series: ISeriesApi<SeriesType>;
	private _p1: Point;
	private _p2: Point;
	private _paneViews: FibonacciPaneView[];
	private _options: FibonacciOptions;
	_requestUpdate: (() => void) | null = null; // Store requestUpdate callback

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		p1: Point,
		p2: Point,
		options?: Partial<FibonacciOptions>
	) {
		this._chart = chart;
		this._series = series;
		this._p1 = p1;
		this._p2 = p2;
		this._options = { ...defaultFibonacciOptions, ...options };
		this._paneViews = [new FibonacciPaneView(this)];
	}

	updateAllViews() {
		this._paneViews.forEach((view) => view.update());
	}

	paneViews() {
		return this._paneViews;
	}

	attached({ requestUpdate }: { requestUpdate: () => void }) {
		this._requestUpdate = requestUpdate; // Save the callback
	}

	get p1() {
		return this._p1;
	}

	get p2() {
		return this._p2;
	}

	get series() {
		return this._series;
	}

	get chart() {
		return this._chart;
	}

	get options() {
		return this._options;
	}
}
