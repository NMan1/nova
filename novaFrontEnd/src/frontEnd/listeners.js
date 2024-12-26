import $ from "jquery";
import { state } from "../chart/chartData";
import { coinApi, loadSymbol } from "../controllers/coinApi";

$(() => {
	$(".tool-btn").on("click", function () {
		$(".tool-btn").removeClass("active");
		$(this).addClass("active");
	});

	$(".timeframe-btn").each(function () {
		const $button = $(this);

		const convertDomTimeframeToCoinApi = (button) => {
			const buttonText = button.text().toLowerCase();
			const intervalType = buttonText.slice(-1);
			const intervalTime = Number(buttonText.slice(0, -1));
			let coinApiInterval = "";

			if (intervalType === "m") {
				coinApiInterval = `${intervalTime}MIN`;
			} else if (intervalType === "h") {
				coinApiInterval = `${intervalTime}HRS`;
			} else if (intervalType === "d") {
				coinApiInterval = `${intervalTime}DAY`;
			} else {
				throw new Error("Unsupported timeframe format");
			}

			return coinApiInterval;
		};

		if (convertDomTimeframeToCoinApi($button) === coinApi.interval) {
			$button.addClass("active");
		}

		$button.on("click", async function () {
			$(".timeframe-btn").removeClass("active");
			$button.addClass("active");

			coinApi.interval = convertDomTimeframeToCoinApi($button);
			await loadSymbol();
		});
	});

	const $spinnerContainer = $("#spinner-container");

	function hideSpinner() {
		$spinnerContainer.css({ visibility: "hidden", opacity: 0 });
	}

	function showSpinner() {
		$spinnerContainer.css({ visibility: "visible", opacity: 1 });
	}

	const checkChartLoaded = setInterval(() => {
		if (state.chartLoaded) {
			hideSpinner();
		} else {
			showSpinner();
		}
	}, 100);

	const $loginWrapper = $("#login-wrapper");
	const $signinContainer = $("#signin-container");
	const $signupContainer = $("#signup-container");
	const $forgotpasswordContainer = $("#forgot-password-container");

	const $searchWrapper = $("#search-wrapper");
	const $searchContainer = $("#search-container");

	$(".signup-btn").on("click", () => {
		$loginWrapper.css({ visibility: "visible", opacity: 1 });
		$signupContainer.css({
			display: "flex",
			opacity: 1,
			visibility: "visible",
		});
		$signinContainer.css("display", "none");
		$forgotpasswordContainer.css("display", "none");
	});

	$(".signin-btn").on("click", () => {
		$loginWrapper.css({ visibility: "visible", opacity: 1 });
		$signinContainer.css({
			display: "flex",
			opacity: 1,
			visibility: "visible",
		});
		$signupContainer.css("display", "none");
		$forgotpasswordContainer.css("display", "none");
	});

	$(".forgot-password.btn").on("click", () => {
		$loginWrapper.css({ visibility: "visible", opacity: 1 });
		$forgotpasswordContainer.css({
			display: "flex",
			opacity: 1,
			visibility: "visible",
		});
		$signupContainer.css("display", "none");
		$signinContainer.css("display", "none");
	});

	$(".login-wrapper-close").on("click", () => {
		$signinContainer.css({ display: "none", opacity: 0, visibility: "hidden" });
		$signupContainer.css({ display: "none", opacity: 0, visibility: "hidden" });
		$loginWrapper.css({ visibility: "hidden", opacity: 0 });
	});

	$(".alt-signup.btn").on("click", () => {
		$signinContainer.css({ display: "none", opacity: 0, visibility: "hidden" });
		$signupContainer.css({
			display: "flex",
			opacity: 1,
			visibility: "visible",
		});
	});

	$("#symbol-search").on("click", () => {
		$searchWrapper.css({ visibility: "visible", opacity: 1 });
		$searchContainer.css({
			display: "flex",
			opacity: 1,
			visibility: "visible",
		});
	});

	$("#search-wrapper-close").on("click", () => {
		$searchWrapper.css({ visibility: "hidden", opacity: 0 });
		$searchContainer.css({
			display: "none",
			opacity: 0,
			visibility: "hidden",
		});
	});
});
