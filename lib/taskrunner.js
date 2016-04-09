'use strict';

var fs = require('fs');

module.exports = function(grunt, childFilesSrcOption, task, target) {
  var done = grunt.task.current.async();
  fs.readFile(childFilesSrcOption, function(err, data) {
    if (err) { throw err; }
    var childFilesSrc = JSON.parse(data);
    var configPath = [task, target];

    // replace the original file config with the smaller file set assigned by
    // the parallelizer
    var targetCfg = grunt.config.get(configPath);
    if (targetCfg.hasOwnProperty('dest')) {
      delete targetCfg.dest;
    }
    if (targetCfg.hasOwnProperty('src')) {
      delete targetCfg.src;
    }
    targetCfg.files = childFilesSrc;
    grunt.config.set(configPath, targetCfg);

    grunt.task.run(configPath.join(':'));
    done();
  });
};
