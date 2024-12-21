import { CanvasRenderingTarget2D } from "fancy-canvas";
import {
	ISeriesPrimitive,
	ISeriesPrimitivePaneRenderer,
	ISeriesPrimitivePaneView,
	SeriesAttachedParameter,
	Time,
} from "lightweight-charts";

interface AnchoredTextOptions {
	x: number;
	y: number;
	text: string;
	lineHeight: number;
	font: string;
	color: string;
}

class AnchoredTextRenderer implements ISeriesPrimitivePaneRenderer {
	_data: AnchoredTextOptions;

	constructor(options: AnchoredTextOptions) {
		this._data = options;
	}

	draw(target: CanvasRenderingTarget2D) {
		target.useBitmapCoordinateSpace((scope) => {
			const ctx = scope.context;
			ctx.font = this._data.font;

			const textWidth = ctx.measureText(this._data.text).width;

			let x = this._data.x - textWidth / 2;

			const lineHeight = this._data.lineHeight;

			// let y = vertMargin + lineHeight;
			let y = this._data.x + lineHeight / 2;
			ctx.fillStyle = this._data.color;
			ctx.beginPath();
			ctx.fillText(this._data.text, x, y);
		});
	}
}

class AnchoredTextPaneView implements ISeriesPrimitivePaneView {
	private _source: AnchoredText;
	constructor(source: AnchoredText) {
		this._source = source;
	}
	update() {}
	renderer() {
		return new AnchoredTextRenderer(this._source._data);
	}
}

export class AnchoredText implements ISeriesPrimitive<Time> {
	_paneViews: AnchoredTextPaneView[];
	_data: AnchoredTextOptions;

	constructor(options: AnchoredTextOptions) {
		this._data = options;
		this._paneViews = [new AnchoredTextPaneView(this)];
	}

	updateAllViews() {
		this._paneViews.forEach((pw) => pw.update());
	}

	paneViews() {
		return this._paneViews;
	}

	requestUpdate?: () => void;
	attached({ requestUpdate }: SeriesAttachedParameter<Time>) {
		this.requestUpdate = requestUpdate;
	}

	detached() {
		this.requestUpdate = undefined;
	}

	applyOptions(options: Partial<AnchoredTextOptions>) {
		this._data = { ...this._data, ...options };
		if (this.requestUpdate) this.requestUpdate();
	}
}
