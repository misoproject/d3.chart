"use strict";
/*jshint unused: false */

var hasOwnProp = Object.hasOwnProperty;

var d3cAssert = function(test, message) {
	if (test) {
		return;
	}
	throw new Error("[d3.chart] " + message);
};

d3cAssert(d3, "d3.js is required");
d3cAssert(typeof d3.version === "string" && d3.version.match(/^3/),
	"d3.js version 3 is required");
