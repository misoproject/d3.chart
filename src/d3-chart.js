(function(window, undefined) {

	"use strict";

	var d3 = window.d3;

	var Surrogate = function(ctor) { this.constructor = ctor; };
	var variadicNew = function(Ctor, args) {
		var inst;
		Surrogate.prototype = Ctor.prototype;
		inst = new Surrogate(Ctor);
		Ctor.apply(inst, args);
		return inst;
	};

	// extend
	// Borrowed from Underscore.js
	function extend(object) {
		var argsIndex, argsLength, iteratee, key;
		if (!object) {
			return object;
		}
		argsLength = arguments.length;
		for (argsIndex = 1; argsIndex < argsLength; argsIndex++) {
			iteratee = arguments[argsIndex];
			if (iteratee) {
				for (key in iteratee) {
					object[key] = iteratee[key];
				}
			}
		}
		return object;
	}

	var Chart = function(selection) {

		var mixin, mixinNs;

		this.base = selection;
		this.layers = {};
		var mixins = this._mixins = [];

		this.initialize.apply(this, Array.prototype.slice.call(arguments, 1));
	};

	Chart.prototype.initialize = function() {};

	Chart.prototype.transform = function(data) {
		return data;
	};

	Chart.prototype.mixin = function(selection, chartName) {
		var args = Array.prototype.slice.call(arguments, 2);
		args.unshift(selection);
		var ctor = Chart[chartName];
		var chart = variadicNew(ctor, args);

		this._mixins.push(chart);
		return chart;
	};

	Chart.prototype.draw = function(data) {

		var layerName, mixinName;

		data = this.transform(data);

		for (layerName in this.layers) {
			this.layers[layerName].draw(data);
		}

		for (mixinName in this._mixins) {
			this._mixins[mixinName].draw(data);
		}
	};

	// d3.chart
	// A factory for creating chart constructors
	d3.chart = function(name, protoProps) {
		var Child = function() { return Chart.apply(this, arguments); };

		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function.
		Surrogate.prototype = Chart.prototype;
		Child.prototype = new Surrogate(Child);

		// Add prototype properties (instance properties) to the subclass, if
		// supplied.
		if (protoProps) extend(Child.prototype, protoProps);

		Chart[name] = Child;
		return Child;
	};

	d3.selection.prototype.chart = function(chartName) {
		var chartArgs = Array.prototype.slice.call(arguments, 1);
		chartArgs.unshift(this);
		var ChartCtor = Chart[chartName];
		return variadicNew(ChartCtor, chartArgs);
	};

}(this));
