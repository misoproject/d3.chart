# d3.chart migration guide

### From 0.2 to 0.3

- Change configuration from AMD- and CommonJS-enabled environments. d3.chart is
  now defined using the Universal Module Definition ("UMD") pattern,
  facilitating more natural consumption from projects that are structured
  according to the AMD or CommonJS module formats.
  - AMD projects should now define an entry to the "paths" configuration for
    "d3.chart" (a "shim" configuration is no longer necessary).
  - CommonJS projects may now include d3.chart directly via
    `require('d3.chart')`.
  - No change is required in projects that include `d3.chart` via an HTML
    `<script>` tag.
- In all cases, this library will continue to define a new property on the
  object exposed by the `d3` module.

### From 0.1 to 0.2

- Update chart definitions:
  - Remove all but the first argument to the `initialize` method. (This may
    requiring refactoring the first argument to support multiple values via a
    generic "options" object.)
- Modify usage of the `Chart#mixin` method:
  - Change references to the `Chart#mixin` method to `Chart#attach`.
  - Instead of invoking with a Chart constructor name, a d3 selection, and
    options for the chart constructor, first instantiate a chart explicitly and
    invoke with a unique instance name and the new chart instance.

Example:

```diff
  d3.chart('ExampleChart', {
-   initialize: function(arg1, arg2) {
+   // If your Chart's `initialize` method has to be changed in this way, don't
+   // forget to also update the usage of the chart.
+   initialize: function(options) {

-     this.mixin('OtherChart', this.base.append('g'), {
-       exampleAttribute: 'value'
-     });
+     // Create the chart explicitly
+     var otherChart = this.base.append('g').chart('OtherChart', {
+       exampleAttribute: 'value'
+     });
+     // Use `Chart#attach` to activate the behavior previously controlled via
+     // `Chart#mixin`--the specified Chart's `draw` method will be
+     // automatically invoked when you call this chart's `draw` method.
+     this.attach('otherChart', otherChart);
    }
  });
```
