module.exports = function(grunt) {
	"use strict";

	grunt.config.set("browserify", {
		foo: {
			files: {
				"test/cjs-app.test-build.js": ["test/cjs-app.js"]
			}
		}
	});

	grunt.loadNpmTasks("grunt-browserify");
};
