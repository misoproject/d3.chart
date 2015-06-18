module.exports = function(grunt) {
	"use strict";

	grunt.config.set("watch", {
		scripts: {
			files: ["src/**/*.js", "test/tests/*.js"],
			tasks: ["jshint"]
		}
	});

	grunt.loadNpmTasks("grunt-contrib-watch");
};
