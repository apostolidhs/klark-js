/* jshint esversion:6, node:true  */

'use strict';

const _ = require('lodash');

module.exports = createModulesDependencyGraph;

function createModulesDependencyGraph(base, appFiles) {
  console.log(appFiles);

  const modulesDependencies = _.map(appFiles, appFile => getModuleDependency(base, appFile));
  console.log(modulesDependencies);

  return Promise.resolve();
}

function getModuleDependency(base, appFile) {
  base = base ? base + '/' : '';  
  return require(base + appFile);
}