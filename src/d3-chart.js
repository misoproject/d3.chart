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

	var secret = {};

	var Chart = function(opts) {

		var mixin, mixinNs;

		if (opts === secret) {
			return this;
		}

		if (opts == null) {
			opts = {};
		}

		if (!this.base) {
			if (!opts.base) {
				opts.base = d3.select("body").append("svg").append("g");
			}
			this.base = opts.base;
		}

		this.layers = {};
		for (mixinNs in this.mixins) {
			// I don't think this approach is technically possible, since you would
			// actually need to call the mixin's constructor (not just its
			// `initialize` method) in order to ensure that the mixin's mixins are
			// created. I guess the Chart constructor could only *conditionally* set
			// `this.layers = {};` if `this.layers` has not already been set, but
			// that has definite code smell.
			//this.mixins[mixinName].prototype.initialize.call(this);
			this[mixinNs] = new this.mixins[mixinNs](secret);
			opts.base = this.base.append("g");
			this.constructor.apply(this[mixinNs], [opts].concat(Array.prototype.slice.call(arguments, 1)));
		}

		this.initialize.apply(this, arguments);
	};

	Chart.prototype.initialize = function() {};

	Chart.prototype.transform = function(data) {
		return data;
	};

	Chart.prototype.draw = function(data) {

		var layerName, mixinNs;

		data = this.transform(data);

		for (layerName in this.layers) {
			this.layers[layerName].draw(data);
		}
		for (mixinNs in this.mixins) {
			this[mixinNs].draw(data);
		}
	};

	window.d3.chart = function(protoProps, staticProps) {
		var parent = Chart;
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

}(this));
