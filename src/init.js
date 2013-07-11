(function(window, undefined) {

"use strict";

var previousD3Chart = window.d3Chart;
var d3Chart = window.d3Chart = {};
var d3 = window.d3;

d3Chart.noConflict = function() {
	window.d3Chart = previousD3Chart;
	return d3Chart;
};

d3Chart.assert = function(test, message) {
	if (test) {
		return;
	}
	throw new Error("[d3.chart] " + message);
};

d3Chart.assert(d3, "d3.js is required");
d3Chart.assert(typeof d3.version === "string" && d3.version.match(/^3/),
	"d3.js version 3 is required");

}(this));
