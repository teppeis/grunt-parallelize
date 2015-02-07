'use strict';

var lpad = require('lpad');

var stdoutWrite = process.stdout.write;

function lpadStdout(pad) {
  process.stdout.write = pad ? function(str) {
    stdoutWrite.call(process.stdout, lpad(str, pad));
  } : stdoutWrite;
}

module.exports = lpadStdout;
