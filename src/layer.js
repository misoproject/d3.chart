(function(window, undefined) {

	"use strict";

	var d3Chart = window.d3Chart;
	var d3 = window.d3;

	var Layer = function(base) {
		d3Chart.assert(base, "Layers must be initialized with a base.");
		this._base = base;
		this._handlers = {};
	};

	// dataBind
	Layer.prototype.dataBind = function() {
		d3Chart.assert(false, "Layers must specify a `dataBind` method.");
	};

	// insert
	Layer.prototype.insert = function() {
		d3Chart.assert(false, "Layers must specify an `insert` method.");
	};

	// on
	// Attach the specified handler to the specified event type.
	Layer.prototype.on = function(eventName, handler, options) {
		options = options || {};
		if (!(eventName in this._handlers)) {
			this._handlers[eventName] = [];
		}
		this._handlers[eventName].push({
			callback: handler,
			chart: options.chart || null
		});
		return this._base;
	};

	// off
	// Remove the specified handler. If no handler is supplied, remove *all*
	// handlers from the specified event type.
	Layer.prototype.off = function(eventName, handler) {

		var handlers = this._handlers[eventName];
		var idx;

		if (!handlers) {
			return this._base;
		}

		if (arguments.length === 1) {
			handlers.length = 0;
			return this._base;
		}

		for (idx = handlers.length - 1; idx > -1; --idx) {
			if (handlers[idx].callback === handler) {
				handlers.splice(idx, 1);
			}
		}
		return this._base;
	};

	// draw
	// Bind the data to the layer, make lifecycle selections, and invoke all
	// relevant handlers.
	Layer.prototype.draw = function(data) {
		var bound, entering, events, selection, handlers, eventName, idx, len;

		bound = this.dataBind.call(this._base, data);

		// Although `bound instanceof d3.selection` is more explicit, it fails
		// in IE8, so we use duck typing to maintain compatability.
		d3Chart.assert(bound && bound.call === d3.selection.prototype.call,
			"Invalid selection defined by `Layer#dataBind` method.");
		d3Chart.assert(bound.enter, "Layer selection not properly bound.");

		entering = bound.enter();
		entering._chart = this._base._chart;

		events = [
			{
				name: "update",
				selection: bound
			},
			{
				name: "enter",
				// Defer invocation of the `insert` method so that the previous
				// `update` selection does not contain the new nodes.
				selection: this.insert.bind(entering)
			},
			{
				name: "merge",
				// This selection will be modified when the previous selection
				// is made.
				selection: bound
			},
			{
				name: "exit",
				selection: bound.exit.bind(bound)
			}
		];

		for (var i = 0, l = events.length; i < l; ++i) {
			eventName = events[i].name;
			selection = events[i].selection;

			// Some lifecycle selections are expressed as functions so that
			// they may be delayed.
			if (typeof selection === "function") {
				selection = selection();
			}

			// Although `selection instanceof d3.selection` is more explicit,
			// it fails in IE8, so we use duck typing to maintain
			// compatability.
			d3Chart.assert(selection &&
				selection.call === d3.selection.prototype.call,
				"Invalid selection defined for '" + eventName +
				"' lifecycle event.");

			handlers = this._handlers[eventName];

			if (handlers) {
				for (idx = 0, len = handlers.length; idx < len; ++idx) {
					// Attach a reference to the parent chart so the selection"s
					// `chart` method will function correctly.
					selection._chart = handlers[idx].chart || this._base._chart;
					selection.call(handlers[idx].callback);
				}
			}

			handlers = this._handlers[eventName + ":transition"];

			if (handlers && handlers.length) {
				selection = selection.transition();
				for (idx = 0, len = handlers.length; idx < len; ++idx) {
					selection._chart = handlers[idx].chart || this._base._chart;
					selection.call(handlers[idx].callback);
				}
			}
		}
	};

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

}(this));
