'use strict';

var fs = require('fs');
var util = require('util');

var _ = require('lodash');
var async = require('async');
var tmp = require('tmp');

var lpad = require('./lpad');

// Remove all temporary files even if an uncaught execption occurs.
// https://github.com/raszi/node-tmp#graceful-cleanup
tmp.setGracefulCleanup();

function Parallelizer(grunt, task) {
  this.grunt_ = grunt;
  this.task_ = task;
  this.cpCache_ = [];
}

Parallelizer.prototype.kill = function() {
  this.cpCache_.forEach(function(el) {
    el.kill();
  });
};

Parallelizer.prototype.exec = function(task, target) {
  var cb = this.task_.async();
  var splittedFilesSrc = this.getSplittedFiles_(task, target);

  var spawnOptions;
  // Optionally log the task output
  // if (options.logConcurrentOutput) {
  //   spawnOptions = { stdio: 'inherit' };
  // }

  var self = this;
  lpad('    ');
  var ok = true;
  async.forEach(splittedFilesSrc, function(filesSrc, next) {
    // need to put filesSrc in a temp file because of command line arg data limit
    var prefix = ['grunt-parallelize', task, target, ''].join('-');
    tmp.file({prefix: prefix}, function(err, tmpFile) {
      if (err) { throw err; }
      fs.writeFile(tmpFile, JSON.stringify(filesSrc), function (err) {
        if (err) { throw err; }
        var filesOption = '--grunt-parallelize-child-filesSrc=' + tmpFile;
        var cp = self.grunt_.util.spawn({
          grunt: true,
          args: [['parallelize', task, target].join(':')].concat(self.grunt_.option.flags(), filesOption),
          opts: spawnOptions
        }, function(err, result, code) {
          if ((err || code > 0)) {
            ok = false;
            if (result.stderr) {
              self.grunt_.warn(result.stderr);
            }
          }
          self.grunt_.log.write('\n' + self.filterOutput_(result.stdout, task, target) + '\n');
          next();
        });
        self.cpCache_.push(cp);
      });
    });
  }, function() {
    lpad();
    if (!ok) {
      self.grunt_.log.writeln('');
    }
    cb(ok);
  });
};

Parallelizer.prototype.filterOutput_ = function(output, task, target) {
  var regex = new RegExp(util.format('^.*Running "parallelize:%s:%s".*\n\n', task, target), 'g');
  return output.replace(regex, '');
};

Parallelizer.prototype.getProcesses_ = function(task, target) {
  var processes = this.grunt_.config(['parallelize', task, target]);
  if (typeof processes === 'number') {
    return processes;
  } else if (processes) {
    processes = this.grunt_.config(['parallelize', task, 'options', 'processes']);
    if (typeof processes === 'number') {
      return processes;
    }
    processes = this.grunt_.config(['parallelize', 'options', 'processes']);
    if (typeof processes === 'number') {
      return processes;
    }
  }

  throw new Error('"processes" option not found');
};

Parallelizer.prototype.getSplittedFiles_ = function(task, target) {
  var files = this.getNormalizedFiles_(task, target);
  var processes = this.getProcesses_(task, target);

  // if any file objects have a destination, can assume that not all src files
  // can be merged into single list
  if (this.hasDest_(files)) {
    return this.splitArray_(files, processes);
  } else {
    var filesSrc = _(files).chain().map('src').flatten().uniq().value();
    return this.splitArray_(filesSrc, processes).map(function(src) {
      return {
        src: src
      };
    });
  }
};

Parallelizer.prototype.getNormalizedFiles_ = function(task, target) {
  var configPath = [task, target];
  var config = this.grunt_.config(configPath);
  return this.grunt_.task.normalizeMultiTaskFiles(config);
};

Parallelizer.prototype.hasDest_ = function(files) {
  return files.some(function(fileObj) {
    return fileObj.dest !== undefined;
  });
};

Parallelizer.prototype.splitArray_ = function(arr, processes) {
  if (processes < 0) {
    throw new Error('"processes" option shoud be positive');
  } else if (!processes) {
    return [];
  }

  var remain = arr.length % processes;
  var per = (arr.length - remain) / processes;
  var splitted = [];
  while (arr.length) {
    splitted.push(arr.splice(0, remain-- > 0 ? per + 1 : per));
  }
  return splitted;
};

module.exports = Parallelizer;
