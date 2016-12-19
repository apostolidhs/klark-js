/* jshint esversion:6, node:true  */

'use strict';

const globby = require('globby');

module.exports = trackApplicationFiles;

function trackApplicationFiles(filesPatterns) {
  const appModules = globby.sync(filesPatterns);
  if (!(appModules && appModules.length)) {
    return Promise.reject(`No source files found from filePatters: (${JSON.stringify(filesPatterns)})`);
  }
  return Promise.resolve(appModules);
}