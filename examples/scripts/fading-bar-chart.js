d3.chart("BarChart").extend("FadingBarChart", {
  initialize: function(options) {

    this.layer("bars").on("enter:transition", this.fadeOut);
    this.layer("bars").on("update:transition", this.fadeOut);

  },
  fadeOut: function() {
    var length = 0;
    this.attr("opacity", function() { length++; });
    this.attr("opacity", function(d, i) {
      return i / length;
    });
  }
});
