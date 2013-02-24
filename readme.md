# d3.chart

A framework for creating reusable charts with [D3.js](http://d3js.org).

## Requirements

`d3.chart` depends on D3.js version 3, so include it only *after* D3.js has been
defined in the document, e.g.

```html
<script src="scripts/lib/d3.v3.min.js"></script>
<script src="scripts/lib/d3-chart.min.js"></script>
```

## Build Instructions

Build requirements:

- [Node.js](http://nodejs.org)
- [Grunt](http://gruntjs.com)

To fetch required dependencies, run the following command from the root of
this repository:

    $ npm install

After this, the project can be built by invoking Grunt from within this
repository:

    $ grunt
