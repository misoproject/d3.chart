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
  var myBarChart = d3.select("body")
    .append("svg").chart("BarChart", { data: dataSrc.data });
  myBarChart.draw();
  setInterval(function() {
    dataSrc.fetch();
    myBarChart.draw();
  }, 1500);

  var dataSrc2 = new DataSrc();
  var myCustomBarChart = d3.select("body")
    .append("svg").chart("BarChart", { data: dataSrc2.data });
  myCustomBarChart.layers.bars.on("update:transition", function() {
    this.attr("opacity", function(d, i) {
      return i / dataSrc2.data.length;
    });
  });
  myCustomBarChart.draw();
  setInterval(function() {
    dataSrc2.fetch();
    myCustomBarChart.draw();
  }, 1500);

  var dataSrc3 = new DataSrc();
  var myFadingBarChart = FadingBarChart({ data: dataSrc3.data });
  myFadingBarChart.draw();
  setInterval(function() {
    dataSrc3.fetch();
    myFadingBarChart.draw();
  }, 1500);

  var myChord = Chord();
  myChord(matrix);

  var colors = ["#000000", "#FFDD89", "#957244", "#F26224"];
  var myCustomChord = Chord();
  myCustomChord.layers.ticks.on("enter", function() {
    this.each(function(data, idx, group) {
      d3.select(this)
        .style("font-weight", "bold")
        .attr("fill", colors[group]);
    });
  });
  myCustomChord(matrix);

  var myImprovedChord = ImprovedChord();
  myImprovedChord(matrix);

}(this));
