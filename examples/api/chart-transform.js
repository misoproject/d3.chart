d3.chart("CircleChart", {
  initialize: function() {
    // assume we create layers and such here.
  },
  transform: function(data) {
    // assume we recieve an object that has 
    // the data array under a values property like so:
    // { values: [...] }
    return data.values;
  }
});

var chart = d3.select(output)
  .append("svg")
  .attr("height", 30)
  .attr("width", 400)
  .chart("CircleChart");

// render it with some data
log(chart.transform({ values: [1,4,6,9,12,13,30]}));
