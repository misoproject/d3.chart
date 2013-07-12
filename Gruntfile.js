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
          browser: true,
          globalstrict: true,
          globals: {
            hasOwnProp: true,
            d3: true,
            d3Chart: true,
            Layer: true,
            Chart: true,
            variadicNew: true
          }
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
            setup: true,
            suiteSetup: true,
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
          " */\n(function(window) {\n",
        footer: "})(this);"
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
        preserveComments: "some",
        sourceMap: "d3.chart.min.map"
      },
      release: {
        files: {
          "d3.chart.min.js": "d3.chart.js"
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default", ["jshint"]);
  grunt.registerTask("release", ["default", "concat", "uglify"]);
};
