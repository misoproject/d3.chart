window.WackyChord = window.Chord.extend({

  initialize: function() {
    var colors = ["#000000", "#FFDD89", "#957244", "#F26223"];

    this.layers.ticks.on("enter", function() {
      this.each(function(data, idx, group) {
        d3.select(this).attr("fill", colors[group]);
      });
    });

  }

});
