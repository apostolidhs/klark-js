/* jshint esversion:6, node:true  */

'use strict';

const _ = require('lodash');

const topologicalGraphSort = require('./topological-graph-sort');

module.exports = resolveModulesDependencyModel;

function resolveModulesDependencyModel(modulesDependencyModel) {
  const graph = topologicalGraphSort();
  _.each(modulesDependencyModel.internalDependencyNamesGraph, (dependencies, moduleName) => {
    _.each(dependencies, dependencyModuleName => graph.add(moduleName, dependencyModuleName));
  });

  try {
    const sortedInnerModules = graph.sort();
    modulesDependencyModel.sortedInnerModules = sortedInnerModules;
    return Promise.resolve(modulesDependencyModel);
  } catch (e) {
    let msg;
    if (e.message === 'CYCLE_GRAPH') {
      msg = `Cycle dependencies on application. Possible predicated module: ${e.node}`;
    }
    return Promise.reject(e || msg);
  }
}