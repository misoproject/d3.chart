module.exports = function(grunt) {
  "use strict";

  grunt.config.set("concat", {
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
  });

  grunt.loadNpmTasks("grunt-contrib-concat");
};
