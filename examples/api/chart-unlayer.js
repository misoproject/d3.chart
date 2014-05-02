d3.chart("CircleChart", {
  initialize: function() {
    // add a circles layer
    var circleLayer = this.unlayer("circles");

    // reattach layer
    this.layer("circles", circleLayer);
  }
});
