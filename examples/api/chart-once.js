d3.chart("CircleChart", {
  initialize: function() {

  },
  action: function() {
    this.trigger("acted", "action executed!");
  }
});

var chart = d3.select(output)
  .chart("CircleChart");

chart.once("acted", function(message){
  log(message);
});

// will only call the above callback once even
// though we will trigger twice
chart.action();
chart.action();
