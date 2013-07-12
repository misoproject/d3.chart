"use strict";

var d3Chart = {};
var d3 = window.d3;
var hasOwnProp = Object.hasOwnProperty;

d3Chart.assert = function(test, message) {
	if (test) {
		return;
	}
	throw new Error("[d3.chart] " + message);
};

d3Chart.assert(d3, "d3.js is required");
d3Chart.assert(typeof d3.version === "string" && d3.version.match(/^3/),
	"d3.js version 3 is required");

var Surrogate = function(ctor) { this.constructor = ctor; };
var variadicNew = function(Ctor, args) {
	var inst;
	Surrogate.prototype = Ctor.prototype;
	inst = new Surrogate(Ctor);
	Ctor.apply(inst, args);
	return inst;
};
