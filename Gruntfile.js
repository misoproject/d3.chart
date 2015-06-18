module.exports = function(grunt) {

	"use strict";

	grunt.initConfig({
		meta: {
			pkg: grunt.file.readJSON("package.json"),
			srcFiles: [
				"src/init.js",
				"src/layer.js",
				"src/layer-extensions.js",
				"src/chart.js",
				"src/chart-extensions.js"
			]
		}
	});

	grunt.loadTasks("build/tasks");

	grunt.registerTask("build", ["concat:release", "uglify"]);

	grunt.registerTask("test-unit", ["mocha:unit"]);
	grunt.registerTask(
		"test-build",
		["concat:test", "mocha:exportsAmd", "mocha:exportsGlobal"]
	);
	grunt.registerTask("test", ["jshint", "test-unit", "test-build"]);

	grunt.registerTask("default", ["test"]);
	grunt.registerTask("release", ["default", "build"]);
};
