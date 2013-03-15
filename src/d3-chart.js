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
    this.initialize.apply(instance, args);
  };

  var Chart = function(selection) {

    var mixin, mixinNs;

    this.base = selection;
    this.layers = {};
    var mixins = this._mixins = [];

    initCascade.call(this, this, Array.prototype.slice.call(arguments, 1));
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

    if (data === undefined) {
      return;
    }

    for (layerName in this.layers) {
      this.layers[layerName].draw(data);
    }

    for (mixinName in this._mixins) {
      this._mixins[mixinName].draw(data);
    }
  };

  Chart.extend = function(name, protoProps, staticProps) {
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
    var chartArgs = Array.prototype.slice.call(arguments, 1);
    chartArgs.unshift(this);
    var ChartCtor = Chart[chartName];
    return variadicNew(ChartCtor, chartArgs);
  };

}(this));
