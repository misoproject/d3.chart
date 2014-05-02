// define a layer
var layer = d3.select(output)
  .append("svg")
  .attr("width", 100)
  .attr("height", 100)
  .layer({
    dataBind: function(data){
      return this.selectAll("rect")
        .data(data);
    },
    insert: function() {
      return this.append("rect");
    },
    events: {
      enter: function() {
        return this.attr("x", function(d){ return d; })
          .attr("y", 48)
          .attr("width", 4)
          .attr("height",4);
      }
    }
  });

// render the layer
layer.draw([10,20,50,90]);
