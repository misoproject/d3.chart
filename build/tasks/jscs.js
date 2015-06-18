module.exports = function(grunt) {
	"use strict";

	grunt.config.set("jscs", {
		src: {
			options: {
				config: ".jscsrc"
			},
			src: [
				"<%= jshint.src.src %>",
				"<%= jshint.build.src %>"
			]
		},
		examples: {
			options: {
				config: "examples/.jscsrc"
			},
			src: ["<%= jshint.examples.src %>"]
		},
		test: {
			options: {
				config: "test/.jscsrc"
			},
			src: ["<%= jshint.test.src %>"]
		}
	});

	grunt.loadNpmTasks("grunt-jscs");
};
