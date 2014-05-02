// define a new chart type: a circle chart
d3.chart("CircleChart", {

  initialize: function() {
    // create a layer of circles that will go into
    // a new group element on the base of the chart
    var circles = this.layer("circles", this.base.append("g"), {

      // select the elements we wish to bind to and 
      // bind the data to them.
      dataBind: function(data) {
        return this.selectAll("circle")
          .data(data);
      },

      // insert actual circles
      insert: function() {
        return this.append("circle");
      }
    });

    circles.on("enter", function() {
      return this.attr("cx", function(d) {
        return d * 10;
      })
      .attr("cy", 10)
      .attr("r", 0)
      .style("fill", "red");
    });

    circles.on("enter:transition", function() {
      return this.delay(500)
            .attr("r", 5)
            .style("fill", "blue");
    });
  }
});

// create an instance of the chart on a d3 selection
var chart = d3.select(output)
  .append("svg")
  .attr("height", 30)
  .attr("width", 400)
  .chart("CircleChart");

// render it with some data
chart.draw([1,4,6,9,12,13,30]);
