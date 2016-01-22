# d3.chart

A framework for creating reusable charts with [D3.js](http://d3js.org).

[![Build Status](https://travis-ci.org/misoproject/d3.chart.png)](https://travis-ci.org/misoproject/d3.chart)

To get started you can:

* Read about reusability in d3 [here](http://weblog.bocoup.com/reusability-with-d3/)
* Read our introduction post to d3.chart [here](http://weblog.bocoup.com/introducing-d3-chart/)
* Dive right into the [wiki](http://github.com/misoproject/d3.chart/wiki), which is full of instructions and guides.
* Check out the [Miso Project website](http://misoproject.com/d3-chart) which has some live coding examples

## Installing

You can install d3.chart via [bower](http://bower.io) by running:

    $ bower install d3.chart

You can also install it via [npm](http://npmjs.org) by running:

    $ npm install d3.chart

Otherwise, you can download it directly from this repository.

## Using

d3.chart implements "UMD", making it convenient to consume from a number of
environments:

- The library may be loaded in a web browser directly via HTML `<script>`
  tags--just be sure to load it *after* D3.js, e.g.

  ```html
  <script src="scripts/lib/d3.v3.min.js"></script>
  <script src="scripts/lib/d3.chart.min.js"></script>
  ```
- From [AMD](https://github.com/amdjs/amdjs-api)-enabled environments, simply
  add an entry for "d3.chart" in your `paths` configuration.
- Consuming using [CommonJS modules](http://wiki.commonjs.org/wiki/Modules/1.1)
  (e.g. via tools like [Browserify](http://browserify.org/)) should "just work"

## Build Instructions

Build requirements:

- [Node.js](http://nodejs.org)
- [Grunt](http://gruntjs.com)

To fetch required dependencies, run the following command from the root of
this repository:

    $ npm install
    $ bower install

After this, the project can be built by invoking Grunt from within this
repository:

    $ grunt
