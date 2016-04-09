'use strict';

var fs = require('fs');

/**
 * Read filepath and then:
 * - do nothing if it is empty.
 * - wait if it contains string like "100ms".
 * - throw an error if it contains the other string.
 *
 * @param {string} filepath
 * @param {Function} callback
 */
module.exports = function(filepath, callback) {
  fs.readFile(filepath, {encoding: 'utf8'}, function(err, body) {
    if (err) {
      callback(err);
      return;
    }

    body = body.replace(/\n$/, '');
    if (body) {
      var match = /^(\d+)ms$/.exec(body);
      if (match) {
        // wait if the file contains number for order.
        // 100ms is enough for local machine, but too small for travis.
        var factor = Number(process.env.DELAY_FACTOR) || 1;
        setTimeout(function() {
          callback();
        }, Number(match[1]) * factor);
      } else {
        // throw the body message.
        callback(new Error(body));
      }
    } else {
      callback();
    }
  });
};
