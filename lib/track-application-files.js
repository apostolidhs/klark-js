'use strict';

var globby = require('globby');

module.exports = trackApplicationFiles;

function trackApplicationFiles(filesPatterns) {
  var appModules = globby.sync(filesPatterns);
  if (!(appModules && appModules.length)) {
    return Promise.reject('No source files found from filePatters: (' + JSON.stringify(filesPatterns) + ')');
  }
  return Promise.resolve(appModules);
}