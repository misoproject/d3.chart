define(function(require, exports, module) {
	"use strict";

	module.exports = function(test, message) {
		if (test) {
			return;
		}
		throw new Error("[d3.chart] " + message);
	};
});
