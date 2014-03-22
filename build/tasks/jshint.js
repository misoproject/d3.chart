module.exports = function(grunt) {
  "use strict";

  grunt.config.set("jshint", {
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
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
};
