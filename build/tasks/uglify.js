module.exports = function(grunt) {
	"use strict";

	grunt.config.set("uglify", {
		options: {
			// Preserve banner
			preserveComments: "some",
			sourceMap: "d3.chart.min.map"
		},
		release: {
			files: {
				"d3.chart.min.js": "d3.chart.js"
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-uglify");
};
