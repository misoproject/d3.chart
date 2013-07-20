"use strict";

// Determine if the current environment satisfies d3.chart's requirements
// for ECMAScript 5 compliance.
var isES5 = (function() {
	try {
		Object.defineProperty({}, "test", {
			get: function() { return true; }
		});
	} catch(err) {
		return false;
	}
	return true;
})();

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
// base class and continuing "upward".
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

// transformCascade
// Call the `transform` method down the inheritance chain, starting with the
// instance and continuing "downward". The result of each transformation should
// be supplied as input to the next.
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

// wrapData
// Given a data point, return an object with customized accessors for each
// of the chart's data attributes.
var wrapDataImpls = {
	ES5: function(dataPoint) {
		if (typeof dataPoint !== "object") {
			return dataPoint;
		}
		var dataProxy = Object.create(this._dataProxy);
		dataProxy._dataPoint = dataPoint;

		return dataProxy;
	},
	legacy: function(dataPoint) {
		var dataProxy, key, getter, dataMapping;

		if (typeof dataPoint !== "object") {
			return dataPoint;
		}
		dataProxy = {};

		dataMapping = this._dataMapping;

		if (!dataMapping) {
			this.dataAttrs.forEach(function(key) {
				dataProxy[key] = dataPoint[key];
			});
		} else {
			this.dataAttrs.forEach(function(key) {
				getter = dataMapping[key];
				if (getter) {
					dataProxy[key] = getter.call(dataPoint);
				} else {
					dataProxy[key] = dataPoint[key];
				}
			}, this);
		}

		return dataProxy;
	}
};

var wrapData = wrapDataImpls[ isES5 ? "ES5" : "legacy" ];

var Chart = function(selection, chartOptions) {

	this.base = selection;
	this._dataMapping = chartOptions && chartOptions.dataMapping;
	this._layers = {};
	this._mixins = [];
	this._events = {};

	initCascade.call(this, this, Array.prototype.slice.call(arguments, 1));

	// Skip data mapping initialization logic if the chart has explicitly
	// opted out of that functionality (generally for performance reasons)
	if (this._dataMapping !== false) {
		createDataProxy.call(this);
	}

};

// createDataProxy
// Initialize a proxy object to facilitate data mapping
var createDataProxy = function() {
	var dataProxy = this._dataProxy = {};
	var dataMapping = this._dataMapping;
	var getters;

	if (dataMapping) {
		getters = {};
		Object.keys(dataMapping).forEach(function(attr) {
			getters[attr] = dataMapping[attr];
		});
	}

	this.dataAttrs.forEach(function(attr) {
		var customGetter = getters && getters[attr];
		var getter;

		if (customGetter) {
			getter = function() {
				return customGetter.call(this._dataPoint);
			};
		} else {
			getter = function() {
				return this._dataPoint[attr];
			};
		}

		if (isES5) {
			Object.defineProperty(dataProxy, attr, {
				get: getter
			});
		} else {
			dataProxy[attr] = getter;
		}
	}, this);

};

Chart.prototype.unlayer = function(name) {
	var layer = this.layer(name);
	var idx = this._layerList.indexOf(layer);

	delete this._layers[name];
	this._layerList.splice(idx, 1);
	return this;
};

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

Chart.prototype.mixin = function(chartName, selection) {
	var args = Array.prototype.slice.call(arguments, 2);
	args.unshift(selection);
	var ctor = Chart[chartName];
	var chart = variadicNew(ctor, args);

	this._mixins.push(chart);
	return chart;
};

Chart.prototype.draw = function(data) {

	var layerName, idx, len, wrappedData;

	if (this._dataMapping !== false && data) {
		wrappedData = data.map(wrapData, this);
		data = wrappedData;
	}

	data = transformCascade.call(this, this, data);

	for (layerName in this._layers) {
		this._layers[layerName].draw(data);
	}

	for (idx = 0, len = this._mixins.length; idx < len; idx++) {
		this._mixins[idx].draw(data);
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

Chart.extend = function(name, protoProps, staticProps) {
	var parent = this;
	var child, dataAttrs;

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

	// Inherit chart data attributes. This allows charts that derive from
	// other charts to use the same attributes for data without
	// compromising their ability to add additional attributes.
	if (hasOwnProp.call(child.prototype, "dataAttrs")) {
		dataAttrs = child.prototype.dataAttrs;
	} else {
		dataAttrs = [];
	}
	dataAttrs.push.apply(dataAttrs, parent.prototype.dataAttrs || []);
	child.prototype.dataAttrs = dataAttrs;

	Chart[name] = child;
	return child;
};
