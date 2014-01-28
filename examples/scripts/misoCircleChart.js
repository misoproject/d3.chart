d3.chart("MisoCircleChart", { 
  initialize: function() { 
 
    var chart = this; 
 
    // assign a css class name to the chart highest container 
    // so that we can also style it 
    chart.base.classed("CircleChart", true); 
 
    // set up some basic defaults if user didn't provide them. 
    chart._height   = chart._height || chart.base.attr("height"); 
    chart._width    = chart._width  || chart.base.attr("width"); 
    chart._radius   = chart._radius || 5; 
    chart._dataAttribute = chart._dataAttribute || "value"; 
 
    // the x scale will be adjusted to fit all circles in. 
    // we give it 2 radii worth of padding on each side. 
    chart.xScale = d3.scale.linear() 
      .range([chart.radius() * 2, chart.width() - (chart.radius() * 2)]); 
 
    // create a circle layer
    chart.layer("circles", this.base.append("g"), {
 
      dataBind: function(data) {
        var chart = this.chart();
 
        // find the min and max of our data values so we can
        // set the domain of the xScale.
        var values = _(data).map(function(datum) {
          return datum[chart.dataAttribute()];
        });
        var dataMin = values.min().value();
        var dataMax = values.max().value();
        chart.xScale.domain([dataMin, dataMax]);
 
        return this.selectAll("circle")
          .data(data);
      },
 
      insert: function() {
        return this.append("circle")
          .classed("circle", true);
      },
 
      events: {
        enter: function() {
          var chart = this.chart();
          // position the circles at the appropriate location
          // and set their size.
          return this.attr("cy", chart.height()/2)
            .attr("cx", function(d) {
              return chart.xScale(d[chart.dataAttribute()]);
            })
            .attr("r", chart.radius());
        }
      }
 
    });
  },
 
  // --- getters/setters.
  radius : function(newRadius) {
    if (arguments.length === 0) {
      return this._radius;
    }
    this._radius = newRadius;
    return this;
  },
 
  width: function(newWidth) {
    if (arguments.length === 0) {
      return this._width;
    }
    this._width = newWidth;
    return this;
  },
 
  height: function(newHeight) {
    if (arguments.length === 0) {
      return this._height;
    }
    this._height = newHeight;
    return this;
  },
  dataAttribute: function(newDataAttribute) {
    if (arguments.length === 0) {
      return this._dataAttribute;
    }
    this._dataAttribute = newDataAttribute;
    return this;
  }
});
 
// create an extended Labeled circle chart that shows
// labels above the circles showing the data value.
d3.chart("MisoCircleChart").extend("LabeledCircleChart", {
  initialize: function() {
 
    var chart = this;
 
    // assign a css class name to the chart highest container
    // so that we can also style it
    chart.base.classed("LabeledCircleChart", true);
 
    // create a labels layer
    this.layer("labels", this.base.append("g"), {
      dataBind: function(data) {
        return this.selectAll("text")
          .data(data);
      },
      insert: function() {
        return this.append("text")
          .attr("text-anchor", "middle")
          .classed("label", true);
      },
      events: {
        enter: function() {
          var chart = this.chart();
 
          // position the labels at the same x of the circle
          // but about two radii's worth above (Which really gives)
          // one radius worth of padding.
          return this.attr("x", function(d) {
            return chart.xScale(d[chart.dataAttribute()]);
          })
          .attr("y", (chart.height() / 2) - (chart.radius()*2))
          .text(function(d) {
            return d[chart.dataAttribute()];
          });
        }
      }
    });
  }
});
