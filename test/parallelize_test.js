'use strict';

var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var ansidiff = require('ansidiff');
var expect = require('expect.js');
var glob = require('glob');
var rimraf = require('rimraf');

describe('grunt-parallelize', function() {
  this.timeout(6000);

  describe('grunt parallelize:task:target', function() {
    it('supports "Compact Format"', function(done) {
      testGruntfile('compactFormat', done);
    });

    it('supports "Files Array Format"', function(done) {
      testGruntfile('filesArrayFormat', done);
    });

    it('supports cwd option', function(done) {
      testGruntfile('cwd', done);
    });

    it('runs and displays all child tasks if some task has error', function(done) {
      testGruntfile('containsError', done);
    });
  });

  describe('grunt parallelize:task', function() {
    it('runs all targets', function(done) {
      testGruntfile('runAllTargets', done);
    });

    it('runs and displays all targets if some target has error', function(done) {
      testGruntfile('someTargetContainsError', done);
    });
  });

  describe('grunt parallelize', function() {
    this.timeout(10000);
    it('runs all tasks', function(done) {
      testGruntfile('runAllTasks', done);
    });
  });

  describe('detect processes', function() {
    it('detects from target options', function(done) {
      testGruntfile('targetOption', done);
    });

    it('detects from task options', function(done) {
      testGruntfile('taskOption', done);
    });
  });

  describe('Writes files', function() {
    it('Compact Format', function(done) {
      testGruntfile('compactFormatWithDest', done);
    });

    it('Files Array Format', function(done) {
      testGruntfile('filesArrayFormatWithDest', done);
    });

    it('Files Object Format', function(done) {
      testGruntfile('filesObjectFormatWithDest', done);
    });
  });
});

function testGruntfile(name, callback) {
  var prefix = path.join(__dirname, 'cases', name);
  var gruntfile = prefix + '.Gruntfile.js';
  var expectedDir = path.join(__dirname, 'fixtures', 'file_output');
  var expectedFiles = glob.sync(path.join(expectedDir, name + '-*.txt'));
  var outputDir = path.join(__dirname, 'output');
  if (expectedFiles.length > 0) {
    // clean up the output dir
    rimraf.sync(outputDir);
  }

  runGruntfile(gruntfile, function(err, stdout, stderr) {
    var expectedStdOut = prefix + (err ? '.ng.txt' : '.ok.txt');
    var expected;
    try {
      expected = fs.readFileSync(expectedStdOut, {encoding: 'utf8'});
    } catch (e) {
      // ng is unexpected.
      console.log('stdout: ' + stdout);
      callback(err || stderr || stdout || true);
      return;
    }
    assertDiff(stdout, expected);

    expectedFiles.forEach(function(expectedFile) {
      var file = path.basename(expectedFile);
      var actual = fs.readFileSync(path.join(outputDir, file), {encoding: 'utf8'});
      var expected = fs.readFileSync(expectedFile, {encoding: 'utf8'});
      assertDiff(actual, expected);
    });
    callback();
  });
}

function assertDiff(actual, expected) {
  try {
    expect(actual).to.be(expected);
  } catch (e) {
    console.error(ansidiff.lines(expected, actual));
    throw e;
  }
}

function runGruntfile(gruntfile, callback) {
  var cmd = ['grunt', '--no-color', '--gruntfile', gruntfile].join(' ');
  var options = {};
  exec(cmd, options, callback);
}
