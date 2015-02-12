'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    writefilesrc: {
      test: {
        files: {
          '../output/filesObjectFormatWithDest-1.txt': '../fixtures/*.txt',
        },
      },
      test_multi: {
        files: {
          '../output/filesObjectFormatWithDest-2.txt': '../fixtures/1.txt',
          '../output/filesObjectFormatWithDest-3.txt': ['../fixtures/3.txt', '../fixtures/4.txt'],
        },
      },
    },

    parallelize: {
      writefilesrc: {
        test: 2,
        test_multi: 2,
      }
    }
  });

  // Load this tasks.
  grunt.loadTasks('../../tasks');
  // Load tasks for testing.
  grunt.loadTasks('../tasks');
  // Set defaut task.
  grunt.registerTask('default', ['parallelize:writefilesrc:test', 'parallelize:writefilesrc:test_multi']);
};
