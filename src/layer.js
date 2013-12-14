"use strict";

/**
 * Create a layer using the provided `base`. The layer instance is *not*
 * exposed to d3.chart users. Instead, its instance methods are mixed in to the
 * `base` selection it describes; users interact with the instance via these
 * bound methods.
 *
 * @private
 * @constructor
 *
 * @param {d3.selection} base The containing DOM node for the layer.
 */
var Layer = function(base) {
	d3cAssert(base, "Layers must be initialized with a base.");
	this._base = base;
	this._handlers = {};
};

/**
 * Invoked by {@link Layer#draw} to join data with this layer's DOM nodes. This
 * implementation is "virtual"--it *must* be overridden by Layer instances.
 *
 * @param {Array} data Value passed to {@link Layer#draw}
 */
Layer.prototype.dataBind = function() {
	d3cAssert(false, "Layers must specify a `dataBind` method.");
};

/**
 * Invoked by {@link Layer#draw} in order to insert new DOM nodes into this
 * layer's `base`. This implementation is "virtual"--it *must* be overridden by
 * Layer instances.
 */
Layer.prototype.insert = function() {
	d3cAssert(false, "Layers must specify an `insert` method.");
};

/**
 * Subscribe a handler to a "lifecycle event". These events (and only these
 * events) are triggered when {@link Layer#draw} is invoked--see that method
 * for more details on lifecycle events.
 *
 * @param {String} eventName Identifier for the lifecycle event for which to
 *        subscribe.
 * @param {Function} handler Callback function
 *
 * @returns {d3.selection} Reference to the layer's base.
 */
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

/**
 * Unsubscribe the specified handler from the specified event. If no handler is
 * supplied, remove *all* handlers from the event.
 *
 * @param {String} eventName Identifier for event from which to remove
 *        unsubscribe
 * @param {Function} handler Callback to remove from the specified event
 *
 * @returns {d3.selection} Reference to the layer's base.
 */
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

/**
 * Render the layer according to the input data: Bind the data to the layer
 * (according to {@link Layer#dataBind}, insert new elements (according to
 * {@link Layer#insert}, make lifecycle selections, and invoke all relevant
 * handlers (as attached via {@link Layer#on}) with the lifecycle selections.
 *
 * - update
 * - update:transition
 * - enter
 * - enter:transition
 * - exit
 * - exit:transition
 *
 * @param {Array} data Data to drive the rendering.
 */
Layer.prototype.draw = function(data) {
	var bound, entering, events, selection, handlers, eventName, idx, len;

	bound = this.dataBind.call(this._base, data);

	// Although `bound instanceof d3.selection` is more explicit, it fails
	// in IE8, so we use duck typing to maintain compatability.
	d3cAssert(bound && bound.call === d3.selection.prototype.call,
		"Invalid selection defined by `Layer#dataBind` method.");
	d3cAssert(bound.enter, "Layer selection not properly bound.");

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
		d3cAssert(selection &&
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
