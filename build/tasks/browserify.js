module.exports = function(grunt) {
	"use strict";

	grunt.config.set("browserify", {
		"test-app": {
			files: {
				"test/sample-cjs-app/packaged.js": [
					"test/sample-cjs-app/main.js"
				]
			},
			options: {
				alias: {
					"d3.chart": "./test/d3.chart.test-build.js"
				}
			}
		}
	});

	grunt.loadNpmTasks("grunt-browserify");
};
