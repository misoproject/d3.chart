(function(window, undefined) {

  var myBarChart = barchart();

  myBarChart();
  setInterval(function() {
    myBarChart.data.shift();
    myBarChart.data.push(myBarChart.next());
    myBarChart();
  }, 1500);

}(this));
