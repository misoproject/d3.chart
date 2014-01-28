/**
* A bar chart. Required data format:
* [ { name : x-axis-bar-label, value : N }, ...]
*
*  Sample use:
*  var bargraph = d3.select('#bargraph')
*    .append('svg')
*    .attr('width', line_w)
*    .attr('height', line_h)
*    .chart('CC-Barchart')
*    .max(1.0);
*  bargraph.draw(bardata);
*/
d3.chart('MisoBarChart', {
  initialize: function() {
    var chart = this;
 
    // default height and width
    chart.w = chart.base.attr('width') || 200;
    chart.h = chart.base.attr('height') || 150;
 
    // chart margins to account for labels.
    // we may want to have setters for this
    // if we were letting the users customize this too
    chart.margins = {
      top : 10,
      bottom : 15,
      left : 50, 
      right : 0, 
      padding : 10 
    }; 
 
    // default chart ranges 
    chart.x =  d3.scale.linear() 
      .range([0, chart.w - chart.margins.left]); 
 
    chart.y = d3.scale.linear() 
      .range([chart.h - chart.margins.bottom, 0]); 
 
    chart.base 
      .classed('Barchart', true); 
 
    // non data driven areas (as in not to be independatly drawn) 
    chart.areas = {}; 
 
    // make sections for labels and main area 
    //  _________________ 
    // |Y|    bars      | 
    // | |              | 
    // | |              | 
    // | |              | 
    // | |______________| 
    //   |      X       | 
 
    // -- areas 
    chart.areas.ylabels = chart.base.append('g') 
      .classed('ylabels', true) 
      .attr('width', chart.margins.left) 
      .attr('height', chart.h - chart.margins.bottom - chart.margins.top) 
      .attr('transform', 'translate('+(chart.margins.left-1)+',0)'); 
 
    chart.areas.bars = chart.base.append('g') 
      .classed('bars', true) 
      .attr('width', chart.w - chart.margins.left) 
      .attr('height', chart.h - chart.margins.bottom - chart.margins.top) 
      .attr('transform', 'translate(' + chart.margins.left + ',' + chart.margins.top+')'); 
 
    chart.areas.xlabels = chart.base.append('g') 
      .classed('xlabels', true) 
      .attr('width', chart.w - chart.margins.left) 
      .attr('height', chart.margins.bottom) 
      .attr('transform', 'translate(' + chart.margins.left + ',' + 
        (chart.h - chart.margins.bottom) + ')'); 
 
    // make actual layers 
    chart.layer('bars', chart.areas.bars, { 
      // data format: 
      // [ { name : x-axis-bar-label, value : N }, ...] 
      dataBind : function(data) { 
 
        // save the data in case we need to reset it 
        chart.data = data; 
 
        // how many bars? 
        chart.bars = data.length; 
 
        // compute box size 
        chart.bar_width = (chart.w - chart.margins.left - ((chart.bars - 1) * 
          chart.margins.padding)) / chart.bars; 
 
        // adjust the x domain - the number of bars. 
        chart.x.domain([0, chart.bars]); 
 
        // adjust the y domain - find the max in the data. 
        chart.datamax = chart.usermax || d3.max(data, function(d) {  
          return d.value;  
        }); 
        chart.y.domain([0, chart.datamax]); 
 
        // draw yaxis 
        var yAxis = d3.svg.axis() 
          .scale(chart.y) 
          .orient('left') 
          .ticks(6);
 
        chart.areas.ylabels
          .call(yAxis);
 
        return this.selectAll('rect')
          .data(data);
      },
      insert : function() {
        return this.append('rect')
          .classed('bar', true);
      }
    });
 
    // a layer for the x text labels.
    chart.layer('xlabels', chart.areas.xlabels, {
      dataBind : function(data) {
        // first append a line to the top.
        this.append('line')
          .attr('x1', 0)
          .attr('x2', chart.w - chart.margins.left)
          .attr('y1', 0)
          .attr('y2', 0)
          .style('stroke', '#222')
          .style('stroke-width', '1')
          .style('shape-rendering', 'crispEdges');
 
 
        return this.selectAll('text')
          .data(data);
      },
      insert : function() {
        return this.append('text')
          .classed('label', true)
          .attr('text-anchor', 'middle')
          .attr('x', function(d, i) {
            return chart.x(i) - 0.5 + chart.bar_width/2;
          })
          .attr('dy', '1em')
          .text(function(d) {
            return d.name;
          });
      }
    });
 
    // on new/update data
    // render the bars.
    var onEnter = function() {
      this.attr('x', function(d, i) {
            return chart.x(i) - 0.5;
          })
          .attr('y', function(d) {
            return chart.h - chart.margins.bottom - chart.margins.top - chart.y(chart.datamax - d.value) - 0.5;
          })
          .attr('val', function(d) {
            return d.value;
          })
          .attr('width', chart.bar_width)
          .attr('height', function(d) {
            //return chart.h - chart.margins.bottom - chart.y(chart.datamax - d.value);
            return chart.y(chart.datamax - d.value);
          });
    };
 
    chart.layer('bars').on('enter', onEnter);
    chart.layer('bars').on('update', onEnter);
  },
 
  // return or set the max of the data. otherwise
  // it will use the data max.
  max : function(datamax) {
    if (!arguments.length) {
      return this.usermax;
    }
 
    this.usermax = datamax;
 
    this.draw(this.data);
 
    return this;
  },
 
  width : function(newWidth) {
    if (!arguments.length) {
      return this.w;
    }
    // save new width
    this.w = newWidth;
 
    // adjust the x scale range
    this.x =  d3.scale.linear()
      .range([this.margins.left, this.w - this.margins.right]);
 
    // adjust the base width
    this.base.attr('width', this.w);
 
    this.draw(this.data);
 
    return this;
  },
 
  height : function(newHeight) {
    if (!arguments.length) {
      return this.h;
    }
 
    // save new height
    this.h = newHeight;
 
    // adjust the y scale
    this.y = d3.scale.linear()
      .range([this.h - this.margins.top, this.margins.bottom]);
 
    // adjust the base width
    this.base.attr('height', this.h);
 
    this.draw(this.data);
    return this;
  }
});