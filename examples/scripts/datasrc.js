// datasrc.js
// A simple data source to feed the bar chart visualization. Based on the
// implementation in "A Bar Chart, part 2":
// http://mbostock.github.com/d3/tutorial/bar-2.html
(function(window, undefined) {

  "use strict";

  var d3 = window.d3;

  var DataSrc = window.DataSrc = function() {
    var self = this;
    this.time = 1297110663; // start time (seconds since epoch)
    this.value = 70;
    this.data = d3.range(33).map(function() { return self.next(); });
  };

  DataSrc.prototype.next = function() {
    this.time += 1;
    this.value = ~~Math.max(10, Math.min(90, this.value + 10 * (Math.random() - .5)));
    return {
      time: this.time,
      value: this.value
    };
  };

  DataSrc.prototype.fetch = function() {
    this.data.shift();
    this.data.push(this.next());
  };

}(this));
