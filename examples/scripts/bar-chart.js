window.BarChart = function(options) {

  "use strict";

  options = options || {};

  var w, h,
    data = options.data || [];

  var x = d3.scale.linear()
    .domain([0, data.length]);

  var y = d3.scale.linear()
    .domain([0, 100]);

  var svg = d3.select("body").append("svg")
    .attr("class", "chart");

  function chart() {

    var rect = svg.selectAll("rect")
      .data(data, function(d) { return d.time; });

    rect.enter().insert("rect", "line")
        .attr("x", function(d, i) { return x(i + 1) - .5; })
        .attr("y", function(d) { return h - y(d.value) - .5; })
        .attr("width", w / data.length)
        .attr("height", function(d) { return y(d.value); })
      .transition()
        .duration(1000)
        .attr("x", function(d, i) { return x(i) - .5; });

    rect.transition()
        .duration(1000)
        .attr("x", function(d, i) { return x(i) - .5; });

    rect.exit().transition()
        .duration(1000)
        .attr("x", function(d, i) { return x(i - 1) - .5; })
        .remove();
  }

  chart.width = function(newWidth) {
    if (!arguments.length) {
      return w;
    }
    w = newWidth;
    x.range([0, w]);
    svg.attr("width", w);
    return this;
  };

  chart.height = function(newHeight) {
    if (!arguments.length) {
      return h;
    }
    h = newHeight;
    y.rangeRound([0, h]);
    svg.attr("height", h);
    return this;
  };

  chart.width(options.width || 600);
  chart.height(options.height || 80);

  return chart;

};
