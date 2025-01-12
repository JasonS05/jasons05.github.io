"use strict";

window.onload = main;

function main() {
	let codeID = parseInt(new URLSearchParams(window.location.search).get("id"));

	if (!isNaN(codeID)) {
		window.location.replace(`/archive.html?id=${codeID}`);
		return;
	}
}

