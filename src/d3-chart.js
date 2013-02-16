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

	var Chart = function(opts) {

		var mixin, mixinNs;

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
		this._mixins = {};

		this.initialize.apply(this, arguments);
	};

	Chart.prototype.initialize = function() {};

	Chart.prototype.transform = function(data) {
		return data;
	};

	Chart.prototype.mixin = function() {
		var mixins, mixinName;

		// Support signature #mixin( <string> name, <Chart> chart )
		if (typeof arguments[0] === "string") {
			mixins = {};
			mixins[arguments[0]] = arguments[1];
		// Support signature #mixin( <object> mixins )
		} else {
			mixins = arguments[0];
		}

		for (mixinName in mixins) {
			if (Object.hasOwnProperty.call(mixins, mixinName)) {
				this._mixins[mixinName] = mixins[mixinName];
				// Extend root-level of instance for easier access (i.e.
				// `this[mixinName]` instead of `this._mixins[mixinName]`)
				this[mixinName] = mixins[mixinName];
			}
		}
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
