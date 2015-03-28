var fs = require('fs');

/**
 * Read filepath and then:
 * - do nothing if it is empty.
 * - wait if it contains string like "100ms".
 * - throw an error if it contains the other string.
 *
 * @param {string} filepath
 */
module.exports = function(filepath, callback) {
  var body = fs.readFileSync(filepath, {encoding: 'utf8'});
  body = body.replace(/\n$/, '');
  if (body) {
    var match = /^(\d+)ms$/.exec(body);
    if (match) {
      // wait if the file contains number for order.
      // 100ms is enough for local machine, but too small for travis.
      var factor = Number(process.env.DELAY_FACTOR) || 1;
      setTimeout(function() {callback();}, Number(match[1]) * factor);
    } else {
      // throw the body message.
      throw new Error(body);
    }
  } else {
    callback();
  }
};
