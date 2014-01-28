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

///////////////////////////////////////////////////////// FEATURED

// 1. Miso Bar Chart    

var barchart = d3.select(document.getElementById("misoBarChart"))
      .append('svg')
      .attr('height', 300)
      .attr('width', 800)
      .chart('MisoBarChart');
     
    barchart.draw([
      { name : 'January', value : 29 },
      { name : 'February', value : 32 },
      { name : 'March', value : 48 },
      { name : 'April', value : 49 },
      { name : 'May', value : 58 },
      { name : 'June', value : 68 },
      { name : 'July', value : 74 },
      { name : 'August', value : 73 },
      { name : 'September', value : 65 },
      { name : 'October', value : 54 },
      { name : 'November', value : 45 },
      { name : 'December', value : 35 }
    ]);


// 2. Miso Circle Chart    

   
var circlechart = d3.select(document.getElementById("misoCircleChart"))
  .append("svg")
  .attr("height", 70)
  .attr("width", 800)
  .chart("MisoCircleChart")
  .dataAttribute("value");
 
var labeledirclechart = d3.select(document.getElementById("misoCircleChart"))
  .append("svg")
  .attr("height", 70)
  .attr("width", 800)
  .chart("LabeledCircleChart")
  .dataAttribute("value")
  .radius(3);
 
var data = [
  { name : "January", month: 1, value : 29 },
  { name : "February", month: 2, value : 32 },
  { name : "March", month: 3, value : 48 },
  { name : "April", month: 4, value : 49 },
  { name : "May", month: 5, value : 58 },
  { name : "June", month: 6, value : 68 },
  { name : "July", month: 7, value : 74 },
  { name : "August", month: 8, value : 73 },
  { name : "September", month: 9, value : 65 },
  { name : "October", month: 10, value : 54 },
  { name : "November", month: 11, value : 45 },
  { name : "December", month: 12, value : 35 }
];
 
circlechart.draw(data);
labeledirclechart.draw(data);
 

///////////////////////////////////////////////////////// EXPERIMENTAL

// 1. Bar Chart    

  var dataSrc = new DataSrc();
  var myBarChart = d3.select( document.getElementById("barChart") )
    .append("svg").chart("BarChart");
  myBarChart.draw(dataSrc);
  setInterval(function() {
    dataSrc.fetch();
    myBarChart.draw(dataSrc);
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
  myCustomBarChart.draw(dataSrc2);
  setInterval(function() {
    dataSrc2.fetch();
    myCustomBarChart.draw(dataSrc2);
  }, 1500);

  // 3. Fading Bar Chart

  var dataSrc3 = new DataSrc();
  var myFadingBarChart = d3.select( document.getElementById("barChartFading") )
    .append("svg").chart("FadingBarChart");
  myFadingBarChart.draw(dataSrc3);
  setInterval(function() {
    dataSrc3.fetch();
    myFadingBarChart.draw(dataSrc3);
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
    series1: dataSrc4,
    series2: matrix
  });
  setInterval(function() {
    dataSrc4.fetch();
    hybrid.draw({
      series1: dataSrc4,
      series2: matrix
    });
  }, 1500);

}(this));
