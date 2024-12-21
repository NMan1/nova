function adjustChartHeight() {
	const chartContainer = document.getElementById("chart-container");
	const aiContainer = document.getElementById("ai-container");

	const aiHeight = aiContainer.offsetHeight;
	chartContainer.style.bottom = `${aiHeight + 1}px`;
}

window.addEventListener("resize", adjustChartHeight);
document.addEventListener("DOMContentLoaded", adjustChartHeight);
