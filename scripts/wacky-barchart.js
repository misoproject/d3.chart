window.wackyBC = function(options) {

    var barchart = window.barchart;
    var chart = barchart(options);

    chart.on("update:transition", function(updating) {
      updating.attr("height", Math.random()*10 + 20);
    });

    return chart;
};
