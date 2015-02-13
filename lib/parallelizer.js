'use strict';

var path = require('path');
var util = require('util');
var async = require('async');
var _ = require('lodash');
var uuid = require('uuid');
var fs = require('fs');
var os = require('os');

var lpad = require('./lpad');

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
  var splittedFilesSrc = this.getSplittedFilesSrc_(task, target);

  var spawnOptions;
  // Optionally log the task output
  // if (options.logConcurrentOutput) {
  //   spawnOptions = { stdio: 'inherit' };
  // }

  var self = this;
  // create /tmp if not exists
  fs.mkdir(os.tmpdir(), function (err) {
    lpad('    ');
    var ok = true;
    async.forEach(splittedFilesSrc, function(filesSrc, next) {
      // need to put filesSrc in a temp file because of command line arg data limit
      var tmpFile = path.join(os.tmpdir(), task + target + uuid.v4());
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
    }, function() {
      lpad();
      if (!ok) {
        self.grunt_.log.writeln('');
      }
      cb(ok);
    });
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

Parallelizer.prototype.getSplittedFilesSrc_ = function(task, target) {
  var filesSrc = this.getNormalizedFilesSrc_(task, target);
  var processes = this.getProcesses_(task, target);
  if (processes < 0) {
    throw new Error('"processes" option shoud be positive');
  } else if (!processes) {
    return [];
  }
  var remain = filesSrc.length % processes;
  var per = (filesSrc.length - remain) / processes;
  var splittedFilesSrc = [];
  while (filesSrc.length) {
    splittedFilesSrc.push(filesSrc.splice(0, remain-- > 0 ? per + 1 : per));
  }
  return splittedFilesSrc;
};

Parallelizer.prototype.getNormalizedFilesSrc_ = function(task, target) {
  var configPath = [task, target];
  var config = this.grunt_.config(configPath);
  var files = this.grunt_.task.normalizeMultiTaskFiles(config);
  // if any file objects have a destination, can assume that not all src files
  // can be merged into single list
  var hasDest = false;
  files.forEach(function (fileObj) {
    if (fileObj.dest !== undefined){ hasDest = true; }
  });
  var normalizedFiles;
  if (hasDest){
    normalizedFiles = files;
  } else {
    normalizedFiles = _(files).chain().pluck('src').flatten().uniq().value();
    normalizedFiles = normalizedFiles.map(function (srcFile) {
      return { src: srcFile, };
    });
  }

  return normalizedFiles;
};

module.exports = Parallelizer;
