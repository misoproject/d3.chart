(function(window, undefined) {

	"use strict";

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

	// initCascade
	// Call the initialize method up the inheritance chain, starting with the
	// base class and continuing "downward".
	function initCascade(instance, args) {
		var sup = this.constructor.__super__;
		if (sup) {
			initCascade.call(sup, instance, args);
		}
		this.initialize.apply(instance, args);
	}

	var Chart = function() {

		this.layers = {};

		initCascade.call(this, this, arguments);
	};

	Chart.prototype.initialize = function() {};

	Chart.prototype.transform = function(data) {
		return data;
	};

	Chart.prototype.draw = function(data) {

		var layerName;

		data = this.transform(data);

		for (layerName in this.layers) {
			this.layers[layerName].draw(data);
		}
	};

	// Method to correctly set up the prototype chain, for subclasses. Borrowed
	// from Backbone.js
	// http://backbonejs.org/
	Chart.extend = function(protoProps, staticProps) {
		var parent = this;
		var child;

		// The constructor function for the new subclass is either defined by you
		// (the "constructor" property in your `extend` definition), or defaulted
		// by us to simply call the parent's constructor.
		if (protoProps && Object.hasOwnProperty.call(protoProps, 'constructor')) {
			child = protoProps.constructor;
		} else {
			child = function(){ return parent.apply(this, arguments); };
		}

		// Add static properties to the constructor function, if supplied.
		extend(child, parent, staticProps);

		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function.
		var Surrogate = function(){ this.constructor = child; };
		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate;

		// Add prototype properties (instance properties) to the subclass, if
		// supplied.
		if (protoProps) extend(child.prototype, protoProps);

		// Set a convenience property in case the parent's prototype is needed
		// later.
		child.__super__ = parent.prototype;

		return child;
	};


	window.d3.chart = Chart;

}(this));
