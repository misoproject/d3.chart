window.ImprovedChord = function(options) {

  "use strict";
  var Chord = window.Chord;

  var improvedChord = Chord(options);
  improvedChord.colors = ["#000000", "#FFDD89", "#957244", "#F26224"];
  improvedChord.layers.ticks.on("enter", function() {
    this.each(function(data, idx, group) {
      d3.select(this)
        .style("font-weight", "bold")
        .attr("fill", improvedChord.colors[group]);
    });
  });

  return improvedChord;

};
