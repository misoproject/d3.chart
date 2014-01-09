# d3.chart migration guide

### From 0.1 to 0.2

- Update chart definitions:
  - Specify the required data attributes with an array of strings named
    `dataAttrs`.

    For example:

    ```javascript
    // when defining a chart, make sure to specify what data attributes
    // the draw routine will be expecting for each data point. For example, 
    // this "chart" just creates a list with items, using their value as
    // the content.
    d3.chart("NumberList", {

      // these are the attributes required by our layers:
      dataAttrs: ['value', 'id'],

      initialize: function() {
        
        // create a new layer for our list
        this.layer("items", this.base.append("ul"), {
          dataBind: function(data) {
         
            return this.selectAll("li")
              .data(data, function(d) { 
                // use the id to identify each item.
                return d.id; 
              });
          },
          insert: function() {
            return this.insert("li");
          },
          events: {
            enter: function() {
              this.text(function(d) {

                // use the item value propery as the content
                // of the li.
                return d.value;
              });
            }
          }
        });
      }
    });

    // when creating an instance of our chart, note the addition
    // a second options argument to the d3.chart("NumberList", options.) 
    // We've added a `dataMapping` property whose values are the 
    // above required dataAttrs in the chart definition. Each attribute
    // is then set to a function that defines how each value is computed
    // based on the original datum.
    // Note that the functions do not take any arguments, and their
    // context is the original datum, so they can reference any attributes of 
    // it directly.
    var nc = d3.select("#vis")
      .chart("NumberList", {
        dataMapping: {
          value: function() { return this.name; },
          id: function() { return this.id; }
        }
      });

    // note that in our data, we do not have a `value` property, but we are
    // going to use the `name` property and then map it to the `value` attribute
    // as we've done above.
    var data = [
      { id: 1, name: "Irene" },
      { id: 2, name: "Mike" },
      { id: 3, name: "Batman" }
    ];

    nc.draw(data);       
    ```
    You can opt out of using data attribute mapping by setting `dataMapping` to 
    `false`, but we strongly discourage author creators from doing so. 

  - Remove all but the first argument to the `initialize` method. (This may
    require refactoring the first argument to support multiple values via a
    generic "options" object.)

    For example:

    ```javascript
    // if your chart constructor was defined using several arguments
    d3.chart("MyChart", {
      initialize: function(arg1, arg2, arg3) {
        // ...
      }
    });

    var chart = d3.select(".vis")
      .chart("MyChart", 12, 14, "top");

    // you would now need to move your arguments into a single object
    // like so:

    d3.chart("MyChart", {
      initialize: function(options) {
        // ...
      }
    });    

    var chart = d3.select(".vis")
      .chart("MyChart", { arg1: 12, arg2: 14, arg3: "top"});
    ```

- Modify usage of the `Chart#mixin` method:
  - Change references to the `Chart#mixin` method to `Chart#attach`.
  - Instead of invoking with a Chart constructor name, a d3 selection, and
    options for the chart constructor, first instantiate a chart explicitly and
    invoke with a unique instance name and the new chart instance.

    For example:

    ```javascript
    // If you've used mixins in the past, they most likely looked like this:
    d3.chart('ExampleChart', {
      initialize: function(options) {
        this.mixin('OtherChart', this.base.append('g'), {
          someInitializationArgument: 'value'
        });
      }
    });

    // Now, in order to attach a chart to another host chart, you would
    // create it, and then use the `attach` call to bind it like so:

    d3.chart('ExampleChart', {
      initialize: function(options) {

        // Create the chart explicitly, the same way you would
        // if it were instantiated on its own.
        var otherChart = this.base.append('g').chart('OtherChart', {
          exampleAttribute: 'value'
        });

        // Use `Chart#attach` to activate the behavior previously controlled via
        // `Chart#mixin`--the specified Chart's `draw` method will be
        // automatically invoked when you call this chart's `draw` method.
        // The first argument is a unique name for this specific chart
        // instance.
        this.attach('otherChart', otherChart);
      }
    });
```
