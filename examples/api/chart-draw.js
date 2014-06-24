// assume previously defined d3.chart called
// CircleChart

// create an instance of the chart on a d3 selection
var chart = d3.select(output)
  .append("svg")
  .attr("height", 30)
  .attr("width", 400)
  .chart("CircleChart");

// render it with some data
chart.draw([1,4,6,9,12,13,30]);
