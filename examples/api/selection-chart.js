d3.chart("CircleChart", {
  initialize: function() {
    // add a circles layer
    this.layer(
      // layer name:
      "circles",

      // give it a container off of the base
      this.base.append("g"),

      {
        // define the data binding function
        dataBind: function(data) {
          return this.selectAll("circle")
            .data(data);
        },
        // define the element inserting 
        insert: function() {
          return this.append("circle");
        },
        // define the life cycle events
        events: {
          enter : function() {
            return this.attr("cx", function(d) {
              return d;
            })
            .attr("cy", 10)
            .attr("r", this.chart().radius());
          }
        }
      }
    );
  },
  radius: function() {
    return 4;
  }
});

var chart = d3.select(output)
  .append("svg")
  .attr("height", 100)
  .attr("width", 200)
  .chart("CircleChart");

chart.draw([10,15,24,53,90]);
