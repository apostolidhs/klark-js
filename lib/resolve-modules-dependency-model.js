'use strict';

var _ = require('lodash');

var topologicalGraphSort = require('./topological-graph-sort');

module.exports = resolveModulesDependencyModel;

function resolveModulesDependencyModel(modulesDependencyModel) {
  var graph = topologicalGraphSort();
  _.each(modulesDependencyModel.internalDependencyNamesGraph, function(dependencies, moduleName) {
    _.each(dependencies, function(dependencyModuleName) {
      graph.add(moduleName, dependencyModuleName);
    });
  });

  try {
    var sortedInnerModules = graph.sort();
    modulesDependencyModel.sortedInnerModules = sortedInnerModules;
    return Promise.resolve(modulesDependencyModel);
  } catch (e) {
    let msg;
    if (e.message === 'CYCLE_GRAPH') {
      msg = 'Cycle dependencies on application. Possible predicated module: ' + e.node;
    }
    return Promise.reject(e || msg);
  }
}