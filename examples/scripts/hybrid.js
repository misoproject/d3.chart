d3.chart("Hybrid", {

  initialize: function() {
    var barHeight = this.barHeight();
    var barWidth = this.radius * 2;

    var chord = this.chord = this.mixin("ImprovedChord", this.base.append("g"));
    var bc = this.bc = this.mixin("FadingBarChart", this.base.append("g"));
    chord.transform = function(data) {
      return d3.chart("Chord").prototype.transform(data.series2);
    };
    bc.transform = function(data) {
      return d3.chart("BarChart").prototype.transform.call(bc, data.series1);
    };

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

  radius: 200,

  barHeight: function() {
    return this.radius / 3;
  },

  transformBars: function() {
    var length = 0;
    var chart = this.chart();

    // Cannot use `this.chart()` here, because it returns the BarChart mixin,
    // not the "hybrid" chart. This behavior should not be overridden
    // (otherwise, using a chart as a mixin will break that chart), but there
    // needs to be a way to access the higher-level chart from an event handler
    // on the mixin.
    var barHeight = chart.barHeight();
    this.attr("x", function() { length++; });
    this.attr("x", null);
    this.attr("transform", function(d, i) {
      return "rotate(" + (-360*i/length) + ",0," + (barHeight - chart.radius) + ")";
    });
  }

});