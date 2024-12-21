import $ from "jquery";
import { chart, candlestickSeries } from "./createChart";
import { lastCrosshairPrice } from "./chartEvents";
import { TrendLine } from "../plugins/trend-line/trend-line";
import { Rectangle } from "../plugins/rectangle-drawing-tool/rectangle-drawing-tool";
import { TextDraw } from "../plugins/text/text";
import { FibonacciTool } from "../plugins/fib/fibonacci-tool";

export let primitives = { primitivesList: [], activePrimitive: null };

export function drawTools(param) {
	switch ($(".tool-btn.active")[0].children[0].id) {
		case "crosshair":
			break;
		case "trendline":
			if (primitives.activePrimitive) {
				addObjectToList("Trendline");
				primitives.activePrimitive = null;
				$(".tool-btn.active").removeClass("active");
				$(".tool-btn").first().addClass("active");
			} else {
				startTrendLine(param.time, lastCrosshairPrice);
			}
			break;
		case "rectangle":
			if (primitives.activePrimitive) {
				addObjectToList("Rectangle");
				primitives.activePrimitive = null;
				$(".tool-btn.active").removeClass("active");
				$(".tool-btn").first().addClass("active");
			} else {
				startRectangle(param.time, lastCrosshairPrice);
			}
			break;
		case "fib":
			if (primitives.activePrimitive) {
				addObjectToList("Fib");
				primitives.activePrimitive = null;
				$(".tool-btn.active").removeClass("active");
				$(".tool-btn").first().addClass("active");
			} else {
				startFibonacci(param.time, lastCrosshairPrice);
			}
			break;
		case "text":
			if (primitives.activePrimitive) {
				addObjectToList("Text");

				primitives.activePrimitive.updateAllViews();
				if (primitives.activePrimitive._requestUpdate) {
					primitives.activePrimitive._requestUpdate();
				}

				primitives.activePrimitive = null;

				$(".tool-btn.active").removeClass("active");
				$(".tool-btn").first().addClass("active");
				disableTextInput();
			} else {
				startText(currentText, param.time, lastCrosshairPrice);
				enableTextInput();
			}
			break;
		default:
			break;
	}
}

export function updateTools(param) {
	if (primitives.activePrimitive) {
		switch ($(".tool-btn.active")[0].children[0].id) {
			case "crosshair":
				break;
			case "trendline":
				updateTrendLine(param.time, lastCrosshairPrice);
				break;
			case "rectangle":
				updateRectangle(param.time, lastCrosshairPrice);
				break;
			case "fib":
				updateFibonacci(param.time, lastCrosshairPrice);
				break;
			case "fib":
				break;
			default:
				break;
		}
	} else {
		switch ($(".tool-btn.active")[0].children[0].id) {
			case "crosshair":
				$("#chart-container").css("cursor", "crosshair");
				break;
			case "text":
				$("#chart-container").css("cursor", "text");
				break;
			default:
				$("#chart-container").css("cursor", "pointer");
				break;
		}
	}
}

let currentText = "";

function enableTextInput() {
	$(document).on("keypress.textInput", (event) => {
		handleTextTool(event);
	});
}

function disableTextInput() {
	$(document).off("keypress.textInput");
	$("#chart-container").css("cursor", "pointer");
	currentText = "";
}

export function handleTextTool(event) {
	if (
		primitives.activePrimitive &&
		$(".tool-btn.active")[0].children[0].id === "text"
	) {
		if (event.key === "Enter") {
			addObjectToList("Text");

			primitives.activePrimitive = null;

			$(".tool-btn.active").removeClass("active");
			$(".tool-btn").first().addClass("active");

			disableTextInput();
			return;
		} else if (event.key === "Backspace") {
			currentText = currentText.slice(0, -1);
		} else {
			currentText += event.key;
		}

		updateText(currentText);
	}
}

export function startTrendLine(time, price) {
	const point1 = {
		time: time,
		price: price,
	};

	const trend = new TrendLine(chart, candlestickSeries, point1, point1, {
		lineColor: "#ffffff",
		width: 1,
		showLabels: false,
	});

	primitives.primitivesList.push(trend);
	primitives.activePrimitive = trend;
	candlestickSeries.attachPrimitive(trend);
}

export function updateTrendLine(time, price) {
	primitives.activePrimitive._p2 = { time: time, price: price };
	primitives.activePrimitive.updateAllViews();

	if (primitives.activePrimitive._requestUpdate) {
		primitives.activePrimitive._requestUpdate();
	}
}

export function startRectangle(time, price) {
	const point1 = {
		time: time,
		price: price,
	};

	const rect = new Rectangle(point1, point1, {
		fillColor: "rgba(255, 255, 255, 0.20)",
		showLabels: false,
	});

	primitives.primitivesList.push(rect);
	primitives.activePrimitive = rect;
	candlestickSeries.attachPrimitive(rect);
}

export function updateRectangle(time, price) {
	primitives.activePrimitive._p2 = { time: time, price: price };
	primitives.activePrimitive.updateAllViews();

	if (primitives.activePrimitive._requestUpdate) {
		primitives.activePrimitive._requestUpdate();
	}
}

export function startText(text, time, price) {
	const point = {
		time: time,
		price: price,
	};

	const textDraw = new TextDraw(chart, candlestickSeries, point, {
		text: text,
		textColor: "rgba(255, 255, 255, 1)",
		lineHeight: 24,
		font: "44px IBM Plex Mono",
	});
	primitives.primitivesList.push(textDraw);
	primitives.activePrimitive = textDraw;
	candlestickSeries.attachPrimitive(textDraw);
}

export function updateText(newText) {
	primitives.activePrimitive._options.text = newText;
	primitives.activePrimitive.updateAllViews();
	if (primitives.activePrimitive._requestUpdate) {
		primitives.activePrimitive._requestUpdate();
	}
}

export function startFibonacci(time, price) {
	const point1 = { time, price };

	const fib = new FibonacciTool(chart, candlestickSeries, point1, point1, {
		lineWidth: 2,
	});

	primitives.primitivesList.push(fib);
	primitives.activePrimitive = fib;
	candlestickSeries.attachPrimitive(fib);
}

export function updateFibonacci(time, price) {
	primitives.activePrimitive._p2 = { time, price };
	primitives.activePrimitive.updateAllViews();
	if (primitives.activePrimitive._requestUpdate) {
		primitives.activePrimitive._requestUpdate();
	}
}

export function addObjectToList(objectType) {
	const svgIcon = objectIcons[objectType.toLowerCase()];
	const activePrimitiveMatch = primitives.primitivesList.find(
		(primitive) => primitive === primitives.activePrimitive
	);

	const $entry = $(`
        <div class="object-entry">
            <div class="object-entry-type">
                ${svgIcon}
                <div>${objectType}</div>
            </div>
            <div class="object-entry-tools">
                <svg class="toggle-visible-object" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">
                    <path
                        fill="currentColor"
                        fill-rule="evenodd"
                        d="M4.56 14a10.05 10.05 0 00.52.91c.41.69 1.04 1.6 1.85 2.5C8.58 19.25 10.95 21 14 21c3.05 0 5.42-1.76 7.07-3.58A17.18 17.18 0 0023.44 14a9.47 9.47 0 00-.52-.91c-.41-.69-1.04-1.6-1.85-2.5C19.42 8.75 17.05 7 14 7c-3.05 0-5.42 1.76-7.07 3.58A17.18 17.18 0 004.56 14zM24 14l.45-.21-.01-.03a7.03 7.03 0 00-.16-.32c-.11-.2-.28-.51-.5-.87-.44-.72-1.1-1.69-1.97-2.65C20.08 7.99 17.45 6 14 6c-3.45 0-6.08 2-7.8 3.92a18.18 18.18 0 00-2.64 3.84v.02h-.01L4 14l-.45-.21-.1.21.1.21L4 14l-.45.21.01.03a5.85 5.85 0 00.16.32c.11.2.28.51.5.87.44.72 1.1 1.69 1.97 2.65C7.92 20.01 10.55 22 14 22c3.45 0 6.08-2 7.8-3.92a18.18 18.18 0 002.64-3.84v-.02h.01L24 14zm0 0l.45.21.1-.21-.1-.21L24 14zm-10-3a3 3 0 100 6 3 3 0 000-6zm-4 3a4 4 0 118 0 4 4 0 01-8 0z"
                    />
                </svg>

                <svg class="delete-object" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">
                    <path
                        fill="currentColor"
                        d="M18 7h5v1h-2.01l-1.33 14.64a1.5 1.5 0 0 1-1.5 1.36H9.84a1.5 1.5 0 0 1-1.49-1.36L7.01 8H5V7h5V6c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v1Zm-6-2a1 1 0 0 0-1 1v1h6V6a1 1 0 0 0-1-1h-4ZM8.02 8l1.32 14.54a.5.5 0 0 0 .5.46h8.33a.5.5 0 0 0 .5-.46L19.99 8H8.02Z"
                    />
                </svg>
            </div>
        </div>
        `);

	$entry.data("primitive", activePrimitiveMatch);
	$("#objects-list").append($entry);
}

const objectIcons = {
	trendline: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">
            <g fill="currentColor" fill-rule="nonzero">
                <path d="M7.354 21.354l14-14-.707-.707-14 14z" />
                <path
                    d="M22.5 7c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM5.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"
                />
            </g>
        </svg>
    `,
	rectangle: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">
            <g fill="currentColor" fill-rule="nonzero">
                <path d="M7.5 6h13v-1h-13z" />
                <path d="M7.5 23h13v-1h-13z" />
                <path d="M5 7.5v13h1v-13z" />
                <path d="M22 7.5v13h1v-13z" />
                <path
                    d="M5.5 7c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM22.5 7c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM22.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM5.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"
                />
            </g>
        </svg>
    `,
	text: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">
            <path
                fill="currentColor"
                d="M8 6.5c0-.28.22-.5.5-.5H14v16h-2v1h5v-1h-2V6h5.5c.28 0 .5.22.5.5V9h1V6.5c0-.83-.67-1.5-1.5-1.5h-12C7.67 5 7 5.67 7 6.5V9h1V6.5Z"
            />
        </svg>
    `,
	fib: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">
            <path
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M4.5 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM2 6.5A2.5 2.5 0 0 1 6.95 6H24v1H6.95A2.5 2.5 0 0 1 2 6.5zM4.5 15a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM2 16.5a2.5 2.5 0 0 1 4.95-.5h13.1a2.5 2.5 0 1 1 0 1H6.95A2.5 2.5 0 0 1 2 16.5zM22.5 15a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-18 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM2 22.5a2.5 2.5 0 0 1 4.95-.5H24v1H6.95A2.5 2.5 0 0 1 2 22.5z"
            />
            <path
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M22.4 8.94l-1.39.63-.41-.91 1.39-.63.41.91zm-4 1.8l-1.39.63-.41-.91 1.39-.63.41.91zm-4 1.8l-1.4.63-.4-.91 1.39-.63.41.91zm-4 1.8l-1.4.63-.4-.91 1.39-.63.41.91z"
            />
        </svg>
    `,
};
