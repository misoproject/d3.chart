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

  function onEnter() {
    this.attr("x", function(d, i) { return x(i + 1) - .5; })
        .attr("y", function(d) { return h - y(d.value) - .5; })
        .attr("width", w / data.length)
        .attr("height", function(d) { return y(d.value); });
  }

  function onEnterTrans() {
    this.duration(1000)
        .attr("x", function(d, i) { return x(i) - .5; });
  }

  function onTrans() {
    this.duration(1000)
        .attr("x", function(d, i) { return x(i) - .5; });
  }

  function onExitTrans() {
    this.duration(1000)
        .attr("x", function(d, i) { return x(i - 1) - .5; })
        .remove();
  }

  function dataBind() {

    return this.selectAll("rect")
      .data(data, function(d) { return d.time; });
  }

  function insert() {
    return this.insert("rect", "line");
  }

  var chart = svg.layer({
    dataBind: dataBind,
    insert: insert
  });

  chart.on("enter", onEnter);
  chart.on("enter:transition", onEnterTrans);
  chart.on("update:transition", onTrans);
  chart.on("exit:transition", onExitTrans);

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
