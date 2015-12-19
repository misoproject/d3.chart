module.exports = function(grunt) {
	"use strict";

	grunt.config.set("jshint", {
		src: {
			options: {
				jshintrc: "src/.jshintrc"
			},
			src: ["src/*.js"]
		},
		examples: {
			options: {
				jshintrc: "examples/api/.jshintrc"
			},
			src: ["examples/api/*.js"]
		},
		test: {
			options: {
				jshintrc: "test/.jshintrc"
			},
			src: ["test/tests/*.js"]
		},
		build: {
			options: {
				jshintrc: "build/.jshintrc"
			},
			src: ["Gruntfile.js", "build/**/*.js"]
		}
	});

	grunt.loadNpmTasks("grunt-contrib-jshint");
};
