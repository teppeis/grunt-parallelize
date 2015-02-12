/*
 * grunt-parallelize
 * https://github.com/teppeis/grunt-parallelize
 *
 * Copyright (c) 2013 Teppei Sato <teppeis@gmail.com>
 * Licensed under the MIT license.
 */
'use strict';

//var fs = require('fs');

/*
 * Write src files to dest file for test.
 */
function createMultiTask(grunt, name) {
  grunt.registerMultiTask(name, 'Check the files exits.', function() {
    var done = this.async();
    grunt.util.async.forEachSeries(this.files, function(file, next) {
      if (!file.dest) {
        throw new Error('Missing dest');
      }

      grunt.file.write(file.dest, JSON.stringify(file.src) + '\n', {encoding: 'utf8'});
      next();
    }, function(err) {
      done(err);
    });
  });
}

module.exports = function(grunt) {
  createMultiTask(grunt, 'writefilesrc');
};

module.exports.createMultiTask = createMultiTask;

