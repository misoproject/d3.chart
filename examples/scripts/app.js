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

  // 1. Bar Chart

  var dataSrc = new DataSrc();
  var myBarChart = d3.select( document.getElementById("barChart") )
    .append("svg").chart("BarChart");
  myBarChart.draw(dataSrc.data);
  setInterval(function() {
    dataSrc.fetch();
    myBarChart.draw(dataSrc.data);
  }, 1500);

  // 2. Custom Bar Chart

  var dataSrc2 = new DataSrc();
  var myCustomBarChart = d3.select( document.getElementById("barChartCustom") )
    .append("svg").chart("BarChart");
  var fadeOut = function() {
    this.attr("opacity", function(d, i) {
      return i / dataSrc2.data.length;
    });
  };
  myCustomBarChart.layer("bars").on("enter:transition", fadeOut);
  myCustomBarChart.layer("bars").on("update:transition", fadeOut);
  myCustomBarChart.draw(dataSrc2.data);
  setInterval(function() {
    dataSrc2.fetch();
    myCustomBarChart.draw(dataSrc2.data);
  }, 1500);

  // 3. Fading Bar Chart

  var dataSrc3 = new DataSrc();
  var myFadingBarChart = d3.select( document.getElementById("barChartFading") )
    .append("svg").chart("FadingBarChart");
  myFadingBarChart.draw(dataSrc3.data);
  setInterval(function() {
    dataSrc3.fetch();
    myFadingBarChart.draw(dataSrc3.data);
  }, 1500);

  // 4. Chord Diagram

  var myChord = d3.select( document.getElementById("chordDiagram") )
    .append("svg").chart("Chord");
  myChord.draw(matrix);

  // 5. Custom Chord Diagram

  var colors = ["#000000", "#FFDD89", "#957244", "#F26224"];
  var myCustomChord = d3.select( document.getElementById("chordDiagramCustom") )
    .append("svg").chart("Chord");
  myCustomChord.layer("ticks").on("enter", function() {
    this.each(function(data, idx, group) {
      d3.select(this)
        .style("font-weight", "bold")
        .attr("fill", colors[group]);
    });
  });
  myCustomChord.draw(matrix);

  // 6. Improved Chord Diagram

  var myImprovedChord = d3.select( document.getElementById("chordDiagramImproved") )
    .append("svg").chart("ImprovedChord");
  myImprovedChord.draw(matrix);

  // 7. Hybrid

  var dataSrc4 = new DataSrc();
  var hybrid = d3.select( document.getElementById("hybrid") )
    .append("svg").chart("Hybrid");
  hybrid.draw({
    series1: dataSrc4.data,
    series2: matrix
  });
  setInterval(function() {
    dataSrc4.fetch();
    hybrid.draw({
      series1: dataSrc4.data,
      series2: matrix
    });
  }, 1500);

}(this));
