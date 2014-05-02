d3.chart("CircleChart", {
  initialize: function() {
    log("Hi! I'm a chart");
  }
});

var chart = d3.select(output)
  .chart("CircleChart");
