module.exports = function(grunt) {
	"use strict";

	grunt.config.set("mocha", {
		unit: {
			src: ["test/index.html"],
			options: {
				run: true
			}
		},
		// Test that the distributed source files function correctly in AMD and
		// "browser global" environments.
		exportsAmd: {
			src: ["test/exports/amd.html"],
			options: {
				run: false
			}
		},
		exportsGlobal: {
			src: ["test/exports/global.html"],
			options: {
				run: true
			}
		}
	});

	grunt.loadNpmTasks("grunt-mocha");
};
