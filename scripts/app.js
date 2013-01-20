(function(window, undefined) {

  var myBarChart = barchart();

  myBarChart.draw();
  setInterval(function() {
    myBarChart.data.shift();
    myBarChart.data.push(myBarChart.next());
    myBarChart.draw();
  }, 1500);

  var myBarChart2 = barchart();

  myBarChart2.on("update:transition", function() {
    this.attr("opacity", function(d, i) { return i/32; });
  });

  myBarChart2.draw();
  setInterval(function() {
    myBarChart2.data.shift();
    myBarChart2.data.push(myBarChart2.next());
    myBarChart2.draw();
  }, 1500);

  var myWackyBarChart = wackyBC();

  myWackyBarChart.draw();
  setInterval(function() {
    myWackyBarChart.data.shift();
    myWackyBarChart.data.push(myBarChart.next());
    myWackyBarChart.draw();
  }, 1500);

  var myChord = chord();
  // From http://mkweb.bcgsc.ca/circos/guide/tables/
  var matrix = [
    [11975,  5871, 8916, 2868],
    [ 1951, 10048, 2060, 6171],
    [ 8010, 16145, 8090, 8045],
    [ 1013,   990,  940, 6907]
  ];

  myChord(matrix);

  var myChord2 = chord();

  myChord2.layers.ticks.on("enter", function(entering) {
    entering.attr("fill", "#a00");
  });
  myChord2(matrix);

  var myWackyChord = wackyChord();
  myWackyChord(matrix);

}(this));
