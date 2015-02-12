'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    writefilesrc: {
      test: {
        files: [
          { dest: '../output/filesArrayFormatWithDest-1.txt', src: '../fixtures/*.txt', },
        ],
      },
      test_multi: {
        files: [
          { dest: '../output/filesArrayFormatWithDest-2.txt', src: '../fixtures/1.txt', },
          { dest: '../output/filesArrayFormatWithDest-3.txt', src: ['../fixtures/3.txt', '../fixtures/4.txt'], },
        ],
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
