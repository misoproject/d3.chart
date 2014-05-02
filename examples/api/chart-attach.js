d3.chart("PieBars", {
  initialize: function() {
    var barchart = this.base.append("svg")
      .chart("BarChart");

    var piechart = this.base.append("svg")
      .chart("PieChart")
      .radius(10);

    this.attach("bars", barchart);
    this.attach("piechart", piechart);
  }
});
