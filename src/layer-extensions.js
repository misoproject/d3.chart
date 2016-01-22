define(function(require) {
	"use strict";
	var d3 = require("d3");

	var Layer = require("./layer");

	/**
	 * Create a new layer on the d3 selection from which it is called.
	 *
	 * @static
	 *
	 * @param {Object} [options] Options to be forwarded to {@link Layer|the Layer
	 *        constructor}
	 * @returns {d3.selection}
	 */
	d3.selection.prototype.layer = function(options) {
		var layer = new Layer(this);
		var eventName;

		// Set layer methods (required)
		layer.dataBind = options.dataBind;
		layer.insert = options.insert;

		// Bind events (optional)
		if ("events" in options) {
			for (eventName in options.events) {
				layer.on(eventName, options.events[eventName]);
			}
		}

		// Mix the public methods into the D3.js selection (bound appropriately)
		this.on = function() { return layer.on.apply(layer, arguments); };
		this.off = function() { return layer.off.apply(layer, arguments); };
		this.draw = function() { return layer.draw.apply(layer, arguments); };

		return this;
	};
});
