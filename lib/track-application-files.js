'use strict';

var _ = require('lodash');
var globby = require('globby');

module.exports = trackApplicationFiles;

function trackApplicationFiles(base, filesPatterns) {
  if (!(_.isString(base) && _.isArray(filesPatterns))) {
    return Promise.reject('trackApplicationFiles: Invalid parameters');
  }

  return globby(filesPatterns, {cwd: base})
    .then(function(appModules) {
      if (!(appModules && appModules.length)) {
        throw new Error('No source files found from filePatters: (' + JSON.stringify(filesPatterns) + ')');
      }
      return appModules;
    });
}