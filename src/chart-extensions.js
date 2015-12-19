define(function(require, exports, module) {
	"use strict";
	var d3 = require("d3");

	var Chart = require("./chart");
	var assert = require("./assert");

	assert(/^3\./.test(d3.version), "d3.js version 3 is required");

	require("./layer-extensions");

	/**
	 * A namespace defined by [the D3.js library](http://d3js.org/). The d3.chart
	 * API is defined within this namespace.
	 * @namespace d3
	 */

	/**
	 * A constructor function defined by [the D3.js library](http://d3js.org/).
	 * @constructor d3.selection
	 * @memberof d3
	 */

	/**
	 * Create a new chart constructor or return a previously-created chart
	 * constructor.
	 *
	 * @static
	 * @memberof d3
	 * @externalExample {runnable} chart
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
	 * @externalExample {runnable} selection-chart
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
		assert(ChartCtor, "No chart registered with name '" + chartName + "'");

		return new ChartCtor(this, options);
	};

	// Implement the zero-argument signature of `d3.selection.prototype.chart`
	// for all selection types.
	d3.selection.enter.prototype.chart = function() {
		return this._chart;
	};
	d3.transition.prototype.chart = d3.selection.enter.prototype.chart;

	module.exports = d3.chart;
});
