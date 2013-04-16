d3.chart("BarChart").extend("FadingBarChart", {
  initialize: function(options) {

    var chart = this;

    this.layers.bars.on("update:transition", function() {
      var length = 0;
      this.attr("opacity", function() { length++; });
      this.attr("opacity", function(d, i) {
        return i / length;
      });
    });

  }
});
