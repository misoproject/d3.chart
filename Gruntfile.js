module.exports = function(grunt) {

  "use strict";

  grunt.initConfig({
    meta: {
      pkg: grunt.file.readJSON("package.json"),
      srcFiles: [
        "src/layer.js",
        "src/chart.js"
      ]
    },
    watch: {
      scripts: {
        files: ["src/**/*.js", "test/tests/*.js"],
        tasks: ["jshint"]
      }
    },
    jshint: {
      options: {
        curly: true,
        undef: true
      },
      chart: {
        options: {
          browser: true
        },
        files: {
          src: "<%= meta.srcFiles %>"
        }
      },
      test: {
        options: {
          globals: {
            d3: true,
            assert: true,
            chai: true,
            setup: true,
            teardown: true,
            suite: true,
            test: true,
            sinon: true
          }
        },
        files: {
          src: ["test/tests/*.js"]
        }
      },
      grunt: {
        options: {
          node: true
        },
        files: {
          src: ["Gruntfile.js"]
        }
      }
    },
    concat: {
      options: {
        banner: "/*! <%= meta.pkg.name %> - v<%= meta.pkg.version %>\n" +
          " *  License: <%= meta.pkg.license %>\n" +
          " *  Date: <%= grunt.template.today('yyyy-mm-dd') %>\n" +
          " */\n"
      },
      dist: {
        files: {
          "dist/d3.chart.js": "<%= meta.srcFiles %>"
        }
      },
      release: {
        files: {
          "d3.chart.js": "<%= meta.srcFiles %>"
        }
      }
    },
    uglify: {
      options: {
        // Preserve banner
        preserveComments: "some"
      },
      dist: {
        files: {
          "dist/d3.chart.min.js": "dist/d3.chart.js"
        }
      },
      release: {
        files: {
          "d3.chart.min.js": "dist/d3.chart.js"
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default", ["jshint", "concat:dist", "uglify:dist"]);
  grunt.registerTask("release", ["jshint", "concat", "uglify"]);
};
