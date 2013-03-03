d3.chart("Hybrid", {

  initialize: function() {
    var radius = 200;
    var barHeight = radius / 3;
    var barWidth = radius * 2;

    var chord = this.chord = this.mixin(this.base.append("g"), "ImprovedChord");
    var bc = this.bc = this.mixin(this.base.append("g"), "FadingBarChart");
    chord.transform = function(data) {
      return d3.chart("Chord").prototype.transform(data.series2);
    };
    bc.transform = function(data) {
      return d3.chart("BarChart").prototype.transform.call(bc, data.series1);
    };

    this.base.attr("width", chord.base.attr("width"));
    this.base.attr("height", chord.base.attr("height"));

    chord.setRadius(radius);
    bc.width(barWidth);
    bc.height(barHeight);
    bc.base.attr("transform",
      "translate(" +
        (this.base.attr("width")/2) +
        "," +
        (this.base.attr("height")/2 + radius - barHeight) +
      ")");
    bc.layers.bars.on("exit:transition", function() {
      this.attr("x", null);
      this.attr("width", 0);
    });
    bc.layers.bars.on("update:transition", function() {
      var length = 0;
      this.attr("x", function() { length++; });
      this.attr("x", null);
      this.attr("transform", function(d, i) {
        return "rotate(" + (-360*i/length) + ",0," + (barHeight-radius) + ")";
      });
    });
  }

});
