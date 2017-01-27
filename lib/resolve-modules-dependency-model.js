'use strict';

var Promise = require('promise');
var _ = require('lodash');

var topologicalGraphSort = require('./topological-graph-sort');
var logger = require('./logger');

module.exports = resolveModulesDependencyModel;

function resolveModulesDependencyModel(modulesDependencyModel) {
  if (!(_.isObject(modulesDependencyModel)
    && _.isObject(modulesDependencyModel.internalDependencyNamesGraph)
    && _.isObject(modulesDependencyModel.internalDependencies))) {
    return Promise.reject('resolveModulesDependencyModel: Invalid parameters');
  }

  var graph = topologicalGraphSort();
  _.each(modulesDependencyModel.internalDependencyNamesGraph, function(dependencies, moduleName) {
    if (_.isEmpty(dependencies)) {
      graph.add(moduleName);
    } else {
      _.each(dependencies, function(dependencyModuleName) {
        graph.add(dependencyModuleName, moduleName);
      });
    }
  });

  var sortedInnerModules;
  try {
    sortedInnerModules = graph.sort();
  } catch (e) {
    let msg;
    if (e.message === 'CYCLE_GRAPH') {
      msg = 'Cycle dependencies on application. Possible predicated module: ' + e.node;
    }
    return Promise.reject(msg || e);
  }

  var innerModulesDifference = _.size(modulesDependencyModel.internalDependencies) - _.size(sortedInnerModules);
  logger.assert(
    innerModulesDifference === 0,
    'The internal dependencies did not sorted properly, ' + Math.abs(innerModulesDifference) + ' are missing.'
  );

  modulesDependencyModel.sortedInnerModules = sortedInnerModules;
  return Promise.resolve(modulesDependencyModel);
}