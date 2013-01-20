window.wackyChord = function(options) {

    var chord = window.chord;
    var chart = chord(options);
    var colors = ["#000000", "#FFDD89", "#957244", "#F26223"];

    chart.layers.ticks.on("enter", function() {
      this.each(function(data, idx, group) {
        d3.select(this).attr("fill", colors[group]);
      });
    });

    return chart;
};
