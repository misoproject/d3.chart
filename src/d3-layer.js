(function(window, undefined) {

	"use strict";

	var d3 = window.d3;

	var errors = {
		noBase: new Error("d3.layer must be initialized with a base"),
		noDataBind: new Error("d3.layer must specify a `dataBind` method."),
		noInsert: new Error("d3.layer must specify an `insert` method.")
	};

	var Layer = function(base) {
		if (!base) {
			throw errors.noBase;
		}
		this.base = base;
		this._handlers = {};
	};

	// dataBind
	Layer.prototype.dataBind = function() {
		throw errors.noDataBind;
	};

	// insert
	Layer.prototype.insert = function() {
		throw errors.noInsert;
	};

	// on
	// Attach the specified handler to the specified event type.
	Layer.prototype.on = function(eventName, handler) {
		if (!(eventName in this._handlers)) {
			this._handlers[eventName] = [];
		}
		this._handlers[eventName].push(handler);
	};

	// off
	// Remove the specified handler. If no handler is supplied, remove *all*
	// handlers from the specified event type.
	Layer.prototype.off = function(eventName, handler) {

		var handlers = this._handlers[eventName];
		var idx, len;

		if (!handlers) {
			return;
		}

		if (arguments.length === 1) {
			handlers.length = 0;
			return;
		}

		for (idx = 0, len = handlers.length; idx < len; ++idx) {
			if (handlers[idx] === handler) {
				handlers.splice(idx, 1);
			}
		}
	};

	// draw
	// Bind the data to the layer, make lifecycle selections, and invoke all
	// relevant handlers.
	Layer.prototype.draw = function(data) {
		var bound, selections, selection, handlers, eventName, idx, len;

		bound = this.dataBind.call(this.base, data);

		selections = {
			enter: this.insert.call(bound.enter()),
			update: bound,
			exit: bound.exit()
		};

		for (eventName in selections) {
			selection = selections[eventName];
			handlers = this._handlers[eventName];

			if (handlers) {
				for (idx = 0, len = handlers.length; idx < len; ++idx) {
					selection.call(handlers[idx]);
				}
			}

			handlers = this._handlers[eventName + ":transition"];

			if (handlers && handlers.length) {
				selection = selection.transition();
				for (idx = 0, len = handlers.length; idx < len; ++idx) {
					selection.call(handlers[idx]);
				}
			}
		}
	};

	d3.selection.prototype.layer = function(options) {
		var layer = new Layer(this);
		layer.dataBind = options.dataBind;
		layer.insert = options.insert;

		// Mix the public methods into the D3.js selection (bound appropriately)
		this.on = function() { return layer.on.apply(layer, arguments); };
		this.off = function() { return layer.off.apply(layer, arguments); };
		this.draw = function() { return layer.draw.apply(layer, arguments); };

		return this;
	};

}(this));
