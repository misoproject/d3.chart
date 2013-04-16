/*! d3.chart - v0.0.1
 *  License: MIT Expat
 *  Date: 2013-04-16
 */
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

	// initCascade
	// Call the initialize method up the inheritance chain, starting with the
	// base class and continuing "downward".
	var initCascade = function(instance, args) {
		var sup = this.constructor.__super__;
		if (sup) {
			initCascade.call(sup, instance, args);
		}
		// Do not invoke the `initialize` method on classers further up the
		// prototype chain.
		if (Object.hasOwnProperty.call(this.constructor.prototype, "initialize")) {
			this.initialize.apply(instance, args);
		}
	};

	var Chart = function(selection) {

		this.base = selection;
		this._layers = {};
		this._mixins = [];
		this._events = {};

		initCascade.call(this, this, Array.prototype.slice.call(arguments, 1));
	};

	Chart.prototype.unlayer = function(name) {
		var layer = this.layer(name);
		var idx = this._layerList.indexOf(layer);

		delete this._layers[name];
		this._layerList.splice(idx, 1);
		return this;
	};

	// TODO: Accept special options: `before` or `after`. These are names of
	// layers in relation to which the new layer should be inserted.
	Chart.prototype.layer = function(name, selection, options) {
		var layer;

		if (arguments.length === 1) {
			return this._layers[name];
		}

		layer = selection.layer(options);

		this._layers[name] = layer;

		selection._chart = this;

		return layer;
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

		for (layerName in this._layers) {
			this._layers[layerName].draw(data);
		}

		for (mixinName in this._mixins) {
			this._mixins[mixinName].draw(data);
		}
	};

	Chart.prototype.on = function(name, callback, context) {
		var events = this._events[name] || (this._events[name] = []);
		events.push({
			callback: callback,
			context: context || this,
			_chart: this
		});
		return this;
	};

	Chart.prototype.once = function(name, callback, context) {
		var self = this;
		var once = function() {
			self.off(name, once);
			callback.apply(this, arguments);
		};
		return this.on(name, once, context);
	};

	Chart.prototype.off = function(name, callback, context) {
		// remove all events
		if (arguments.length === 0) {
			this._events = {};
			return this;
		}

		// remove all events for a specific name
		if (arguments.length === 1) {
			this._events[name] = [];
			return this;
		}

		// remove all events that match whatever combination of name, context and callback.
		var names, n, events, ev, i, j, retain = [];

		names = name ? [name] : Object.keys(this._events);
		for (i = 0; i < names.length; i++) {
			n = names[i];
			events = this._events[n];
			retain = [];
			for (j = 0; j < events.length; j++) {
				ev = events[j];
				if ((callback && callback !== ev.callback) ||
						(context && context != ev.context)) {
					retain.push(ev);
				}
			}
			this._events[n] = retain;
		}

		return this;
	};

	Chart.prototype.trigger = function(name) {
		var args = Array.prototype.slice.call(arguments, 1);
		var events = this._events[name];
		var i, ev;

		for (i = 0; i < events.length; i++) {
			ev = events[i];
			ev.callback.apply(ev.context, args);
		}
		return this;
	};

	Chart.extend = function(name, protoProps, staticProps) {
		var parent = this;
		var child;

		// The constructor function for the new subclass is either defined by you
		// (the "constructor" property in your `extend` definition), or defaulted
		// by us to simply call the parent's constructor.
		if (protoProps && Object.hasOwnProperty.call(protoProps, "constructor")) {
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

	// d3.chart
	// A factory for creating chart constructors
	d3.chart = function(name) {
		if (arguments.length === 0) {
			return Chart;
		} else if (arguments.length === 1) {
			return Chart[name];
		}

		return Chart.extend.apply(Chart, arguments);
	};

	d3.selection.prototype.chart = function(chartName) {
		// Without an argument, attempt to resolve the current selection's
		// containing d3.chart.
		if (arguments.length === 0) {
			return this._chart;
		}
		var chartArgs = Array.prototype.slice.call(arguments, 1);
		chartArgs.unshift(this);
		var ChartCtor = Chart[chartName];
		return variadicNew(ChartCtor, chartArgs);
	};

}(this));
