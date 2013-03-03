window.FadingBarChart = function(options) {

  "use strict";
  var BarChart = window.BarChart;

  var fadingBarChart = BarChart(options);

  fadingBarChart.on("update:transition", function() {
    var length = 0;
    // Terrible hack to get the length of the selection
    this.attr("opacity", function() { length++; });
    this.attr("opacity", function(d, i) {
      return i / length;
    });
  });

  return fadingBarChart;
};
