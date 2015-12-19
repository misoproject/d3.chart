define(function(require, exports, module) {
	"use strict";
	var assert = require("./assert");
	var hasOwnProp = Object.hasOwnProperty;

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

	/**
	 * Call the {@Chart#initialize} method up the inheritance chain, starting with
	 * the base class and continuing "downward".
	 *
	 * @private
	 */
	var initCascade = function(instance, args) {
		var ctor = this.constructor;
		var sup = ctor.__super__;
		if (sup) {
			initCascade.call(sup, instance, args);
		}

		// Do not invoke the `initialize` method on classes further up the
		// prototype chain (again).
		if (hasOwnProp.call(ctor.prototype, "initialize")) {
			this.initialize.apply(instance, args);
		}
	};

	/**
	 * Call the `transform` method down the inheritance chain, starting with the
	 * instance and continuing "upward". The result of each transformation should
	 * be supplied as input to the next.
	 *
	 * @private
	 */
	var transformCascade = function(instance, data) {
		var ctor = this.constructor;
		var sup = ctor.__super__;

		// Unlike `initialize`, the `transform` method has significance when
		// attached directly to a chart instance. Ensure that this transform takes
		// first but is not invoked on later recursions.
		if (this === instance && hasOwnProp.call(this, "transform")) {
			data = this.transform(data);
		}

		// Do not invoke the `transform` method on classes further up the prototype
		// chain (yet).
		if (hasOwnProp.call(ctor.prototype, "transform")) {
			data = ctor.prototype.transform.call(instance, data);
		}

		if (sup) {
			data = transformCascade.call(sup, instance, data);
		}

		return data;
	};

	/**
	 * Create a d3.chart
	 *
	 * @constructor
	 * @externalExample {runnable} chart
	 *
	 * @param {d3.selection} selection The chart's "base" DOM node. This should
	 *        contain any nodes that the chart generates.
	 * @param {mixed} chartOptions A value for controlling how the chart should be
	 *        created. This value will be forwarded to {@link Chart#initialize}, so
	 *        charts may define additional properties for consumers to modify their
	 *        behavior during initialization. The following attributes will be
	 *        copied onto the chart instance (if present):
	 * @param {Function} [chartOptions.transform] - A data transformation function
	 *        unique to the Chart instance being created. If specified, this
	 *        function will be invoked after all inherited implementations as part
	 *        of the `Chart#draw` operation.
	 * @param {Function} [chartOptions.demux] - A data filtering function for
	 *        attachment charts. If specified, this function will be invoked with
	 *        every {@link Chart#draw|draw} operation and provided with two
	 *        arguments: the attachment name (see {@link Chart#attach}) and the
	 *        data.
	 *
	 * @constructor
	 */
	var Chart = function(selection, chartOptions) {
		this.base = selection;
		this._layers = {};
		this._attached = {};
		this._events = {};

		if (chartOptions && chartOptions.transform) {
			this.transform = chartOptions.transform;
		}

		initCascade.call(this, this, [chartOptions]);
	};

	/**
	 * Set up a chart instance. This method is intended to be overridden by Charts
	 * authored with this library. It will be invoked with a single argument: the
	 * `options` value supplied to the {@link Chart|constructor}.
	 *
	 * For charts that are defined as extensions of other charts using
	 * `Chart.extend`, each chart's `initilize` method will be invoked starting
	 * with the "oldest" ancestor (see the private {@link initCascade} function for
	 * more details).
	 */
	Chart.prototype.initialize = function() {};

	/**
	 * Remove a layer from the chart.
	 *
	 * @externalExample chart-unlayer
	 *
	 * @param {String} name The name of the layer to remove.
	 *
	 * @returns {Layer} The layer removed by this operation.
	 */
	Chart.prototype.unlayer = function(name) {
		var layer = this.layer(name);

		delete this._layers[name];
		delete layer._chart;

		return layer;
	};

	/**
	 * Interact with the chart's {@link Layer|layers}.
	 *
	 * If only a `name` is provided, simply return the layer registered to that
	 * name (if any).
	 *
	 * If a `name` and `selection` are provided, treat the `selection` as a
	 * previously-created layer and attach it to the chart with the specified
	 * `name`.
	 *
	 * If all three arguments are specified, initialize a new {@link Layer} using
	 * the specified `selection` as a base passing along the specified `options`.
	 *
	 * The {@link Layer.draw} method of attached layers will be invoked
	 * whenever this chart's {@link Chart#draw} is invoked and will receive the
	 * data (optionally modified by the chart's {@link Chart#transform} method.
	 *
	 * @externalExample chart-layer
	 *
	 * @param {String} name Name of the layer to attach or retrieve.
	 * @param {d3.selection|Layer} [selection] The layer's base or a
	 *        previously-created {@link Layer}.
	 * @param {Object} [options] Options to be forwarded to {@link Layer|the Layer
	 *        constructor}
	 *
	 * @returns {Layer}
	 */
	Chart.prototype.layer = function(name, selection, options) {
		var layer;

		if (arguments.length === 1) {
			return this._layers[name];
		}

		// we are reattaching a previous layer, which the
		// selection argument is now set to.
		if (arguments.length === 2) {

			if (typeof selection.draw === "function") {
				selection._chart = this;
				this._layers[name] = selection;
				return this._layers[name];

			} else {
				assert(false, "When reattaching a layer, the second argument " +
					"must be a d3.chart layer");
			}
		}

		layer = selection.layer(options);

		this._layers[name] = layer;

		selection._chart = this;

		return layer;
	};

	/**
	 * Register or retrieve an "attachment" Chart. The "attachment" chart's `draw`
	 * method will be invoked whenever the containing chart's `draw` method is
	 * invoked.
	 *
	 * @externalExample chart-attach
	 *
	 * @param {String} attachmentName Name of the attachment
	 * @param {Chart} [chart] d3.chart to register as a mix in of this chart. When
	 *        unspecified, this method will return the attachment previously
	 *        registered with the specified `attachmentName` (if any).
	 *
	 * @returns {Chart} Reference to this chart (chainable).
	 */
	Chart.prototype.attach = function(attachmentName, chart) {
		if (arguments.length === 1) {
			return this._attached[attachmentName];
		}

		this._attached[attachmentName] = chart;
		return chart;
	};

	/**
	 * A "hook" method that you may define to modify input data before it is used
	 * to draw the chart's layers and attachments. This method will be used by all
	 * sub-classes (see {@link transformCascade} for details).
	 *
	 * Note you will most likely never call this method directly, but rather
	 * include it as part of a chart definition, and then rely on d3.chart to
	 * invoke it when you draw the chart with {@link Chart#draw}.
	 *
	 * @externalExample {runnable} chart-transform
	 *
	 * @param {Array} data Input data provided to @link Chart#draw}.
	 *
	 * @returns {mixed} Data to be used in drawing the chart's layers and
	 *                  attachments.
	 */
	Chart.prototype.transform = function(data) {
		return data;
	};

	/**
	 * Update the chart's representation in the DOM, drawing all of its layers and
	 * any "attachment" charts (as attached via {@link Chart#attach}).
	 *
	 * @externalExample chart-draw
	 *
	 * @param {Object} data Data to pass to the {@link Layer#draw|draw method} of
	 *        this cart's {@link Layer|layers} (if any) and the {@link
	 *        Chart#draw|draw method} of this chart's attachments (if any).
	 */
	Chart.prototype.draw = function(data) {

		var layerName, attachmentName, attachmentData;

		data = transformCascade.call(this, this, data);

		for (layerName in this._layers) {
			this._layers[layerName].draw(data);
		}

		for (attachmentName in this._attached) {
			if (this.demux) {
				attachmentData = this.demux(attachmentName, data);
			} else {
				attachmentData = data;
			}
			this._attached[attachmentName].draw(attachmentData);
		}
	};

	/**
	 * Function invoked with the context specified when the handler was bound (via
	 * {@link Chart#on} {@link Chart#once}).
	 *
	 * @callback ChartEventHandler
	 * @param {...*} arguments Invoked with the arguments passed to {@link
	 *         Chart#trigger}
	 */

	/**
	 * Subscribe a callback function to an event triggered on the chart. See {@link
	 * Chart#once} to subscribe a callback function to an event for one occurence.
	 *
	 * @externalExample {runnable} chart-on
	 *
	 * @param {String} name Name of the event
	 * @param {ChartEventHandler} callback Function to be invoked when the event
	 *        occurs
	 * @param {Object} [context] Value to set as `this` when invoking the
	 *        `callback`. Defaults to the chart instance.
	 *
	 * @returns {Chart} A reference to this chart (chainable).
	 */
	Chart.prototype.on = function(name, callback, context) {
		var events = this._events[name] || (this._events[name] = []);
		events.push({
			callback: callback,
			context: context || this,
			_chart: this
		});
		return this;
	};

	/**
	 * Subscribe a callback function to an event triggered on the chart. This
	 * function will be invoked at the next occurance of the event and immediately
	 * unsubscribed. See {@link Chart#on} to subscribe a callback function to an
	 * event indefinitely.
	 *
	 * @externalExample {runnable} chart-once
	 *
	 * @param {String} name Name of the event
	 * @param {ChartEventHandler} callback Function to be invoked when the event
	 *        occurs
	 * @param {Object} [context] Value to set as `this` when invoking the
	 *        `callback`. Defaults to the chart instance
	 *
	 * @returns {Chart} A reference to this chart (chainable)
	 */
	Chart.prototype.once = function(name, callback, context) {
		var self = this;
		var once = function() {
			self.off(name, once);
			callback.apply(this, arguments);
		};
		return this.on(name, once, context);
	};

	/**
	 * Unsubscribe one or more callback functions from an event triggered on the
	 * chart. When no arguments are specified, *all* handlers will be unsubscribed.
	 * When only a `name` is specified, all handlers subscribed to that event will
	 * be unsubscribed. When a `name` and `callback` are specified, only that
	 * function will be unsubscribed from that event. When a `name` and `context`
	 * are specified (but `callback` is omitted), all events bound to the given
	 * event with the given context will be unsubscribed.
	 *
	 * @externalExample {runnable} chart-off
	 *
	 * @param {String} [name] Name of the event to be unsubscribed
	 * @param {ChartEventHandler} [callback] Function to be unsubscribed
	 * @param {Object} [context] Contexts to be unsubscribe
	 *
	 * @returns {Chart} A reference to this chart (chainable).
	 */
	Chart.prototype.off = function(name, callback, context) {
		var names, n, events, event, i, j;

		// remove all events
		if (arguments.length === 0) {
			for (name in this._events) {
				this._events[name].length = 0;
			}
			return this;
		}

		// remove all events for a specific name
		if (arguments.length === 1) {
			events = this._events[name];
			if (events) {
				events.length = 0;
			}
			return this;
		}

		// remove all events that match whatever combination of name, context
		// and callback.
		names = name ? [name] : Object.keys(this._events);
		for (i = 0; i < names.length; i++) {
			n = names[i];
			events = this._events[n];
			j = events.length;
			while (j--) {
				event = events[j];
				if ((callback && callback === event.callback) ||
						(context && context === event.context)) {
					events.splice(j, 1);
				}
			}
		}

		return this;
	};

	/**
	 * Publish an event on this chart with the given `name`.
	 *
	 * @externalExample {runnable} chart-trigger
	 *
	 * @param {String} name Name of the event to publish
	 * @param {...*} arguments Values with which to invoke the registered
	 *        callbacks.
	 *
	 * @returns {Chart} A reference to this chart (chainable).
	 */
	Chart.prototype.trigger = function(name) {
		var args = Array.prototype.slice.call(arguments, 1);
		var events = this._events[name];
		var i, ev;

		if (events !== undefined) {
			for (i = 0; i < events.length; i++) {
				ev = events[i];
				ev.callback.apply(ev.context, args);
			}
		}

		return this;
	};

	/**
	 * Create a new {@link Chart} constructor with the provided options acting as
	 * "overrides" for the default chart instance methods. Allows for basic
	 * inheritance so that new chart constructors may be defined in terms of
	 * existing chart constructors. Based on the `extend` function defined by
	 * [Backbone.js](http://backbonejs.org/).
	 *
	 * @static
	 * @externalExample {runnable} chart-extend
	 *
	 * @param {String} name Identifier for the new Chart constructor.
	 * @param {Object} protoProps Properties to set on the new chart's prototype.
	 * @param {Object} staticProps Properties to set on the chart constructor
	 *        itself.
	 *
	 * @returns {Function} A new Chart constructor
	 */
	Chart.extend = function(name, protoProps, staticProps) {
		var parent = this;
		var child;

		// The constructor function for the new subclass is either defined by
		// you (the "constructor" property in your `extend` definition), or
		// defaulted by us to simply call the parent's constructor.
		if (protoProps && hasOwnProp.call(protoProps, "constructor")) {
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
		child.prototype = new Surrogate();

		// Add prototype properties (instance properties) to the subclass, if
		// supplied.
		if (protoProps) { extend(child.prototype, protoProps); }

		// Set a convenience property in case the parent's prototype is needed
		// later.
		child.__super__ = parent.prototype;

		Chart[name] = child;
		return child;
	};

	module.exports = Chart;
});
