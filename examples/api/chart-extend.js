d3.chart("CircleChart", {
  initialize: function() {
    log("Hi! I'm a chart");
  }
});

d3.chart("CircleChart").extend("OtherCircleChart", {
  initialize: function() {
    log("I am a circle chart based on the one above!");
  }
});

var chart = d3.select(output)
  .chart("OtherCircleChart");
