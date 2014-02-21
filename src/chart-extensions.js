"use strict";

/**
 * Create a new chart constructor or return a previously-created chart
 * constructor.
 *
 * @static
 *
 * @param {String} name If no other arguments are specified, return the
 *        previously-created chart with this name.
 * @param {Object} protoProps If specified, this value will be forwarded to
 *        {@link Chart.extend} and used to create a new chart.
 * @param {Object} staticProps If specified, this value will be forwarded to
 *        {@link Chart.extend} and used to create a new chart.
 */
d3.chart = function(name) {
	if (arguments.length === 0) {
		return Chart;
	} else if (arguments.length === 1) {
		return Chart[name];
	}

	return Chart.extend.apply(Chart, arguments);
};

/**
 * Instantiate a chart or return the chart that the current selection belongs
 * to.
 *
 * @static
 *
 * @param {String} [chartName] The name of the chart to instantiate. If the
 *        name is unspecified, this method will return the chart that the
 *        current selection belongs to.
 * @param {mixed} options The options to use when instantiated the new chart.
 *        See {@link Chart} for more information.
 */
d3.selection.prototype.chart = function(chartName, options) {
	// Without an argument, attempt to resolve the current selection's
	// containing d3.chart.
	if (arguments.length === 0) {
		return this._chart;
	}
	var ChartCtor = Chart[chartName];
	d3cAssert(ChartCtor, "No chart registered with name '" + chartName + "'");

	return new ChartCtor(this, options);
};

// Implement the zero-argument signature of `d3.selection.prototype.chart`
// for all selection types.
d3.selection.enter.prototype.chart = function() {
	return this._chart;
};
d3.transition.prototype.chart = d3.selection.enter.prototype.chart;
