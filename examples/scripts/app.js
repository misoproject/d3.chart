(function(window, undefined) {

  "use strict";

  var d3 = window.d3;
  var DataSrc = window.DataSrc;
  var BarChart = window.BarChart;

  var dataSrc = new DataSrc();
  var myBarChart = BarChart({ data: dataSrc.data });
  myBarChart();
  setInterval(function() {
    dataSrc.fetch();
    myBarChart();
  }, 1500);

}(this));
