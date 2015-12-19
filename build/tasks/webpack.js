var webpack = require("webpack");

module.exports = function(grunt) {
	"use strict";

	grunt.config.set("webpack", {
		options: require("../webpack.config.js"),
		dist: {
			output: {
				filename: "d3.chart.js"
			}
		},
		"dist-min": {
			output: {
				filename: "d3.chart.min.js",
				sourceMapFilename: "d3.chart.min.map",
			},
			devtool: "source-map",
			plugins: [
				new webpack.optimize.UglifyJsPlugin()
			]
		},
		test: {
			output: {
				filename: "test/d3.chart.test-build.js"
			}
		}
	});

	grunt.loadNpmTasks("grunt-webpack");
};
