module.exports = function(grunt) {

	"use strict";

	grunt.loadTasks("build/tasks");

	grunt.registerTask("build", ["webpack:dist", "webpack:dist-min"]);

	grunt.registerTask("test-unit", ["mocha:unit"]);
	grunt.registerTask(
		"test-build",
		[
			"webpack:test", "browserify", "mocha:exportsAmd",
			"mocha:exportsCommonjs", "mocha:exportsGlobal"
		]
	);
	grunt.registerTask("test", ["jshint", "jscs", "test-unit", "test-build"]);

	grunt.registerTask("default", ["test"]);
	grunt.registerTask("release", ["default", "build"]);
};
