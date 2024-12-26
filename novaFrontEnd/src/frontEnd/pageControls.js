import $ from "jquery";
import { chart, candlestickSeries } from "../chart/createChart";
import { lastCrosshairPrice } from "../chart/chartEvents";
import { primitives } from "../chart/drawingTools";

export const formatUnixDate = (date) =>
	new Date(date * 1000)
		.toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "2-digit",
		})
		.replace(",", "");

$("#chart-container").contextmenu(function (event) {
	event.preventDefault();

	$(".custom-context-menu").remove();

	createContextMenu(event.pageX, event.pageY);
});

export function resetChartScale() {
	chart.timeScale().fitContent();
	chart.priceScale("right").applyOptions({ autoScale: true });
	chart.timeScale().resetTimeScale();
}

function createContextMenu(x, y) {
	const precision = candlestickSeries.options().priceFormat.precision;
	const menu = $(`
	  <div class="custom-context-menu">
		<div class="menu-item" id="reset-chart-view">
		  <i class="fas fa-undo"></i> Reset Chart View
		</div>
		<div class="menu-item" id="copy-price">
		  <i class="fas fa-copy"></i> Copy Price ${lastCrosshairPrice.toFixed(
				precision
			)}
		</div>
	  </div>
	`);

	$("body").append(menu);

	menu.css({
		top: y + "px",
		left: x + "px",
	});

	attachMenuActions();

	$(document).on("click", () => {
		$(".custom-context-menu").remove();
	});
}

function attachMenuActions() {
	$("#reset-chart-view").on("click", () => {
		resetChartScale();
		$(".custom-context-menu").remove();
	});

	$("#copy-price").on("click", () => {
		navigator.clipboard.writeText(lastCrosshairPrice.toString());
		$(".custom-context-menu").remove();
	});
}

const symbolName = "BTC-USD";
const container = document.getElementById("chart-container");

const legend = document.createElement("div");
legend.style = `position: absolute; left: 12px; top: 12px; z-index: 2; font-size: 12px; line-height: 15px; font-weight: 500;`;
legend.style.color = "white";
container.appendChild(legend);

const getLastBar = (series) => {
	const lastIndex = series.dataByIndex(Number.MAX_SAFE_INTEGER, -1);
	return series.dataByIndex(lastIndex);
};

const formatPrice = (price) => (Math.round(price * 100) / 100).toFixed(2);
const setTooltipHtml = (name, date, price) => {
	legend.innerHTML = `<div style="font-size: 12px; margin: 4px 0px;">${name}</div><div style="font-size: 14px; margin: 4px 0px;">$${price}</div><div>${formatUnixDate(
		date
	)}</div>`;
};

export function formatToolTip(param, validCrosshairPoint) {
	const bar = validCrosshairPoint
		? param.seriesData.get(candlestickSeries)
		: getLastBar(candlestickSeries);

	if (bar === null || bar === undefined) {
		return;
	}

	const time = bar.time;
	const price = bar.value !== undefined ? bar.value : bar.close;
	const formattedPrice = formatPrice(price);
	setTooltipHtml(symbolName, time, formattedPrice);
}

$("#objects-list").on("click", ".toggle-visible-object", {});

$("#objects-list").on("click", ".delete-object", (event) => {
	const $entry = $(event.target.closest(".object-entry"));
	const primitive = $entry.data("primitive");

	candlestickSeries.detachPrimitive(primitive);
	primitives.primitivesList = primitives.primitivesList.filter(
		(p) => p !== primitive
	);

	if (primitive._requestUpdate) {
		primitive._requestUpdate();
	} else {
		primitive.requestUpdateInternal();
	}

	setTimeout(() => {
		$(event.target.closest(".object-entry")).remove();
	}, 100);
});

export function toggleSigninupBtns(isLoggedIn) {
	$("#signupin-container").css("display", isLoggedIn ? "none" : "flex");
	$("#account-status-container").css("display", isLoggedIn ? "flex" : "none");
}

export function intializeUser(user) {
	$("#account-status-username").text(
		user.name.charAt(0).toUpperCase() + user.name.slice(1)
	);
	$("#user-avatar-circle").text(user.name.charAt(0).toUpperCase());
}
