window.WackyBC = window.Barchart.extend({

  initialize: function(options) {

    this.layers.bars.on("update:transition", function(updating) {
      updating.attr("height", Math.random()*10 + 20);
    });

  }
});
