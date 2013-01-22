window.Barchart = d3.chart.extend({

  initialize: function(options) {
    var svg,
      t = 1297110663, // start time (seconds since epoch)
      v = 70, // start value (subscribers)
      data = d3.range(33).map(next); // starting dataset

    function next() {
      return {
        time: ++t,
        value: v = ~~Math.max(10, Math.min(90, v + 10 * (Math.random() - .5)))
      };
    }

    options = options || {};

    var w = options.width || 20,
      h = options.height || 80;

    var x = d3.scale.linear()
      .domain([0, 1])
      .range([0, w]);

    var y = d3.scale.linear()
      .domain([0, 100])
      .rangeRound([0, h]);

    var svg = d3.select("body").append("svg")
      .attr("class", "chart")
      .attr("width", w * data.length - 1)
      .attr("height", h);

    function onEnter() {
      this.attr("x", function(d, i) { return x(i + 1) - .5; })
          .attr("y", function(d) { return h - y(d.value) - .5; })
          .attr("width", w)
          .attr("height", function(d) { return y(d.value); })
    }

    function onEnterTrans() {
      this.duration(1000)
          .attr("x", function(d, i) { return x(i) - .5; });
    }

    function onTrans() {
      this.duration(1000)
          .attr("x", function(d, i) { return x(i) - .5; });
    }

    function onExitTrans() {
      this.duration(1000)
          .attr("x", function(d, i) { return x(i - 1) - .5; })
          .remove();
    }

    // This bar chart manages its own data outside of the framework, so we'll
    // ignore the data passed to the `dataBind` method. It wouldn't take much to
    // make this implementation a little more intuitive, though.
    function dataBind(_) {

      return this.selectAll("rect")
        .data(data, function(d) { return d.time; });
    }

    function insert() {
      return this.insert("rect", "line");
    }

    this.layers.bars = svg.layer({
      dataBind: dataBind,
      insert: insert
    });

    this.layers.bars.on("enter", onEnter);
    this.layers.bars.on("enter:transition", onEnterTrans);
    this.layers.bars.on("update:transition", onTrans);
    this.layers.bars.on("exit:transition", onExitTrans);

    this.data = data;
    this.next = next;

  }

});
