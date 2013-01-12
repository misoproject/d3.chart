(function(window, undefined) {

  var myBarChart = barchart();

  myBarChart.draw();
  setInterval(function() {
    myBarChart.data.shift();
    myBarChart.data.push(myBarChart.next());
    myBarChart.draw();
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

}(this));
