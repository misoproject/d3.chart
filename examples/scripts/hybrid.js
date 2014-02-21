d3.chart("Hybrid", {

  initialize: function() {
    var barHeight = this.barHeight();
    var barWidth = this.radius * 2;

    var chord = this.chord = this.base.append("g").chart("ImprovedChord");
    this.attach("chord", chord);
    var bc = this.bc = this.base.append("g").chart("FadingBarChart");
    this.attach("bc", bc);

    this.base.attr("width", chord.base.attr("width"));
    this.base.attr("height", chord.base.attr("height"));

    chord.setRadius(this.radius);
    bc.width(barWidth);
    bc.height(barHeight);
    bc.base.attr("transform",
      "translate(" +
        (this.base.attr("width")/2) +
        "," +
        (this.base.attr("height")/2 + this.radius - barHeight) +
      ")");
    bc.layer("bars").on("exit:transition", function() {
      this.attr("x", null);
      this.attr("width", 0);
    });
    bc.layer("bars").on("enter:transition", this.transformBars, { chart : this });
    bc.layer("bars").on("update:transition", this.transformBars, { chart : this });
  },

  demux: function(attachmentName, data) {
    if (attachmentName === "chord") {
      return data.series2;
    } else {
      return data.series1;
    }
  },

  radius: 200,

  barHeight: function() {
    return this.radius / 3;
  },

  transformBars: function() {
    var length = 0;
    var chart = this.chart();

    // Cannot use `this.chart()` here, because it returns the BarChart
    // attachment, not the "hybrid" chart. This behavior should not be
    // overridden (otherwise, using a chart as a mixin will break that chart),
    // but there needs to be a way to access the higher-level chart from an
    // event handler on the mixin.
    var barHeight = chart.barHeight();
    this.attr("x", function() { length++; });
    this.attr("x", null);
    this.attr("transform", function(d, i) {
      return "rotate(" + (-360*i/length) + ",0," + (barHeight - chart.radius) + ")";
    });
  }

});
