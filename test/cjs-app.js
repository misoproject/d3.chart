var d3 = require("d3");
require("./d3.chart.test-build");

// Explicitly leak the value exported by the `d3` module for use in the unit
// tests.
window.d3 = d3;
