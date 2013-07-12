"use strict";

// d3.chart
// A factory for creating chart constructors
d3.chart = function(name) {
	if (arguments.length === 0) {
		return Chart;
	} else if (arguments.length === 1) {
		return Chart[name];
	}

	return Chart.extend.apply(Chart, arguments);
};

d3.selection.prototype.chart = function(chartName) {
	// Without an argument, attempt to resolve the current selection's
	// containing d3.chart.
	if (arguments.length === 0) {
		return this._chart;
	}
	var ChartCtor = Chart[chartName];
	var chartArgs;
	d3cAssert(ChartCtor, "No chart registered with name '" + chartName + "'");

	chartArgs = Array.prototype.slice.call(arguments, 1);
	chartArgs.unshift(this);
	return variadicNew(ChartCtor, chartArgs);
};

d3.selection.enter.prototype.chart = function() {
	return this._chart;
};

d3.transition.prototype.chart = d3.selection.enter.prototype.chart;
