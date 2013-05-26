d3.chart("Chord").extend("ImprovedChord", {

  initialize: function(options) {

    var chart = this;
    this.colors = ["#000000", "#FFDD89", "#957244", "#F26224"];

    this.layer("ticks").on("enter", function() {
      this.each(function(data, idx, group) {
        d3.select(this)
          .style("font-weight", "bold")
          .attr("fill", chart.colors[group]);
      });
    });

  }

});
