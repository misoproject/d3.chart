d3.chart("Chord", {

  initialize: function(options) {

    options = options || {};

    var chart = this;
    this.width(options.width || 800);
    this.height(options.height || 500);
    this.setRadius();

    var base = chart.base.append("g").attr("transform",
      "translate(" + this.width() / 2 + "," + this.height() / 2 + ")");

    var fill = d3.scale.ordinal()
        .domain(d3.range(4))
        .range(["#000000", "#FFDD89", "#957244", "#F26223"]);

    function onEnterHandles() {
      this.style("fill", function(d) { return fill(d.index); })
          .style("stroke", function(d) { return fill(d.index); })
          .attr("d", d3.svg.arc()
              .innerRadius(chart.innerRadius)
              .outerRadius(chart.outerRadius))
          .on("mouseover", fade(.1))
          .on("mouseout", fade(1));
    }

    function onEnterTicks() {
      this.attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + chart.outerRadius + ",0)";
          });

      this.append("line")
          .attr("x1", 1)
          .attr("y1", 0)
          .attr("x2", 5)
          .attr("y2", 0)
          .style("stroke", "#000");

      this.append("text")
          .attr("x", 8)
          .attr("dy", ".35em")
          .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-16)" : null; })
          .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
          .text(function(d) { return d.label; });
    }

    function onEnterChords() {
      this.attr("d", d3.svg.chord().radius(chart.innerRadius))
          .style("fill", function(d) { return fill(d.target.index); })
          .style("opacity", 1);
    }

    this.layer("handles", base.append("g"), {
      dataBind: function(chord) {
        return this.selectAll("path").data(chord.groups);
      },
      insert: function() {
        return this.append("path");
      }
    });
    this.layer("handles").on("enter", onEnterHandles);

    this.layer("ticks", base.append("g"), {
      dataBind: function(chord) {
        return this.selectAll("g")
            .data(chord.groups)
          .enter().append("g").selectAll("g")
            .data(groupTicks);
      },
      insert: function() {
        return this.append("g");
      }
    });
    this.layer("ticks").on("enter", onEnterTicks);

    this.layer("chords", base.append("g").attr("class", "chord"), {
      dataBind: function(chord) {
        return this.selectAll("path").data(chord.chords);
      },
      insert: function() {
        return this.append("path");
      }
    });
    this.layer("chords").on("enter", onEnterChords);

    function chord(matrix) {

      layers.handles.draw(chord);
      layers.ticks.draw(chord);
      layers.chords.draw(chord);
    }

    // Returns an array of tick angles and labels, given a group.
    function groupTicks(d) {
      var k = (d.endAngle - d.startAngle) / d.value;
      return d3.range(0, d.value, 1000).map(function(v, i) {
        return {
          angle: v * k + d.startAngle,
          label: i % 5 ? null : v / 1000 + "k"
        };
      });
    }

    // Returns an event handler for fading a given chord group.
    function fade(opacity) {
      return function(g, i) {
        chart.base.selectAll(".chord path")
            .filter(function(d) { return d.source.index != i && d.target.index != i; })
          .transition()
            .style("opacity", opacity);
      };
    }

  },

  width: function(newWidth) {
    if (!arguments.length) {
      return this._width;
    }
    this._width = newWidth;
    this.base.attr("width", this._width);
    this.setRadius();
    return this;
  },

  height: function(newHeight) {
    if (!arguments.length) {
      return this._height;
    }
    this._height = newHeight;
    this.base.attr("height", this._height);
    this.setRadius();
    return this;
  },

  setRadius: function(radius) {
    if (!arguments.length) {
      radius = Math.min(this.width(), this.height()) * 0.41;
    }
    this.outerRadius = radius;
    this.innerRadius = radius / 1.1;
    return this;
  },

  transform: function(data) {
    return d3.layout.chord()
        .padding(.05)
        .sortSubgroups(d3.descending)
        .matrix(data);
  }

});
