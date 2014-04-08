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
        unused: true,
        undef: true,
        quotmark: "double",
        trailing: false
      },
      chart: {
        options: {
          browser: true,
          globalstrict: true,
          globals: {
            hasOwnProp: true,
            d3: true,
            d3cAssert: true,
            Layer: true,
            Chart: true
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
          node: true,
          scripturl: true
        },
        files: {
          src: ["Gruntfile.js"]
        }
      }
    },
    mocha: {
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
    },
    concat: {
      options: {
        banner: "/*! <%= meta.pkg.name %> - v<%= meta.pkg.version %>\n" +
          " *  License: <%= meta.pkg.license %>\n" +
          " *  Date: <%= grunt.template.today('yyyy-mm-dd') %>\n" +
          " */\n"
      },
      test: {
        files: {
          "d3.chart.test.js": [
            "src/wrapper/start.frag",
            "<%= meta.srcFiles %>",
            "src/wrapper/end.frag"
          ]
        }
      },
      release: {
        files: {
          "d3.chart.js": [
            "src/wrapper/start.frag",
            "<%= meta.srcFiles %>",
            "src/wrapper/end.frag"
          ]
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
  grunt.loadNpmTasks("grunt-mocha");

  grunt.registerTask("build", ["concat:release", "uglify"]);

  grunt.registerTask("test-unit", ["mocha:unit"]);
  grunt.registerTask(
    "test-build", ["concat:test", "mocha:exportsAmd", "mocha:exportsGlobal"]
  );
  grunt.registerTask("test", ["test-unit", "test-build"]);

  grunt.registerTask("default", ["jshint", "test"]);
  grunt.registerTask("release", ["default", "build"]);
};
