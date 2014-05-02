d3.chart("CircleChart", {
  initialize: function() {

  },
  action: function() {
    this.trigger("acted", "action executed!");
  }
});

var chart = d3.select(output)
  .chart("CircleChart");

chart.on("acted", function(message){
  log(message);
});

// will trigger
chart.action();

chart.off();

// won't trigger
chart.action();
