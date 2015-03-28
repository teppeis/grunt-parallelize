/*
 * grunt-parallelize
 * https://github.com/teppeis/grunt-parallelize
 *
 * Copyright (c) 2013 Teppei Sato <teppeis@gmail.com>
 * Licensed under the MIT license.
 */
'use strict';

var async = require('async');
var consume = require('../lib/consumesource');

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
      grunt.log.writeln('- ' + file.dest);
      grunt.file.write(file.dest, JSON.stringify(file.src) + '\n', {encoding: 'utf8'});
      async.each(file.src, consume, next);
    }, function(err) {
      done(err);
    });
  });
}

module.exports = function(grunt) {
  createMultiTask(grunt, 'writefilesrc');
};

module.exports.createMultiTask = createMultiTask;
