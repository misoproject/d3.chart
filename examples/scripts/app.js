(function(window, undefined) {

  "use strict";

  var d3 = window.d3;
  var DataSrc = window.DataSrc;
  var BarChart = window.BarChart;
  var Chord = window.Chord;
  // From http://mkweb.bcgsc.ca/circos/guide/tables/
  var matrix = [
    [11975,  5871, 8916, 2868],
    [ 1951, 10048, 2060, 6171],
    [ 8010, 16145, 8090, 8045],
    [ 1013,   990,  940, 6907]
  ];

  var dataSrc = new DataSrc();
  var myBarChart = BarChart({ data: dataSrc.data });
  myBarChart.draw();
  setInterval(function() {
    dataSrc.fetch();
    myBarChart.draw();
  }, 1500);

  var myChord = Chord();
  myChord(matrix);

}(this));
