d3.chart("BarChart").extend("FadingBarChart", {
  initialize: function(options) {

    var chart = this;

    this.layers.bars.on("update:transition", function() {
      this.attr("opacity", function(d, i) {
        return i / chart.data.length;
      });
    });

  }
});
