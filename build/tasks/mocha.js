module.exports = function(grunt) {
	"use strict";

	/**
	 * In order to limit duplication (and promote consistency), the testing
	 * configuration re-uses the same `index.html` file for all tests. The
	 * test setup logic implements branching behavior based on the value of the
	 * userAgent string, which is set programatically according to the
	 * configuration below. (This information cannot be specified using a query
	 * string parameter because `index.html` is loaded via the file://
	 * protocol.)
	 */

	grunt.config.set("mocha", {
		options: {
			run: false
		},
		unit: {
			src: ["test/index.html"],
			options: {
				page: {
					settings: {
						userAgent: "PhantomJS:testSource(direct)"
					}
				}
			}
		},
		// Test that the distributed source files function correctly in AMD and
		// "browser global" environments.
		exportsAmd: {
			src: ["test/index.html"],
			options: {
				page: {
					settings: {
						userAgent: "PhantomJS:testSource(amd)"
					}
				}
			}
		},
		exportsCommonjs: {
			src: ["test/index.html"],
			options: {
				page: {
					settings: {
						userAgent: "PhantomJS:testSource(commonjs)"
					}
				}
			}
		},
		exportsGlobal: {
			src: ["test/index.html"],
			options: {
				page: {
					settings: {
						userAgent: "PhantomJS:testSource(global)"
					}
				}
			}
		}
	});

	grunt.loadNpmTasks("grunt-mocha");
};
