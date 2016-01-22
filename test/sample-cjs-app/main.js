/**
 * This file is used to prove CommonJS support. It is built for the browser
 * prior to running tests, and the exported "app" global is used to derive the
 * test environment's reference to d3.chart.
 */
"use strict";

var d3 = require("d3");

if (Object.prototype.hasOwnProperty.call(d3, "chart")) {
	throw new Error("d3.chart incorrectly loaded prior to import.");
}

window.app = {
	d3: d3,
	d3chart: require("d3.chart")
};
