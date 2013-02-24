module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    concat: {
      options: {
        banner: "/*! <%= pkg.name %> - v<%= pkg.version %>\n" +
          " *  License: <%= pkg.license %>\n" +
          " *  Date: <%= grunt.template.today('yyyy-mm-dd') %>\n" +
          " */\n"
      },
      dist: {
        files: {
          "dist/d3.chart.js": [
            "src/d3-layer.js",
            "src/d3-chart.js"
          ]
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
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");

  grunt.registerTask("default", ["concat", "uglify"]);
};
