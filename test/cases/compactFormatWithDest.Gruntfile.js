'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    writefilesrc: {
      test_src: {
        dest: '../output/compactFormatWithDest-1.txt',
        src: '../fixtures/*.txt',
      }
    },

    parallelize: {
      writefilesrc: {
        test_src: 2,
      }
    }
  });

  // Load this tasks.
  grunt.loadTasks('../../tasks');
  // Load tasks for testing.
  grunt.loadTasks('../tasks');
  // Set defaut task.
  grunt.registerTask('default', ['parallelize:writefilesrc:test_src']);
};
