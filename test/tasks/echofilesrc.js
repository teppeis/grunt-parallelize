/*
 * grunt-parallelize
 * https://github.com/teppeis/grunt-parallelize
 *
 * Copyright (c) 2013 Teppei Sato <teppeis@gmail.com>
 * Licensed under the MIT license.
 */
'use strict';

var fs = require('fs');
var consume = require('../lib/consumesource');

/*
 * Echo filesSrc for test.
 */
function createMultiTask(grunt, name) {
  grunt.registerMultiTask(name, 'Check the files exits.', function() {
    var done = this.async();
    grunt.util.async.forEachSeries(this.filesSrc, function(file, next) {
      grunt.log.writeln('- ' + file);
      consume(file, next);
    }, function(err) {
      done(err);
    });
  });
}

module.exports = function(grunt) {
  createMultiTask(grunt, 'echofilesrc');
  createMultiTask(grunt, 'echofilesrc2');
};

module.exports.createMultiTask = createMultiTask;
