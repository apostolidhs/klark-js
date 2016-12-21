'use strict';

var _ = require('lodash');

module.exports = instantiateModules;

function instantiateModules(resolvedModulesDependencyModel) {
  instantiateExternalDependencies(resolvedModulesDependencyModel.externalDependencies);
  instantiateInternalDependencies(resolvedModulesDependencyModel);
}

function instantiateExternalDependencies(externalDependencies) {
  _.each(externalDependencies, function(truly, externalDependency) {
    try {
      externalDependencies[externalDependency] = require(externalDependency);
    } catch (e) {
      throw new Error(['Error on External library ', externalDependency, '. ', e.message, '. ', e.stack].join(''));
    }
  });
}

function instantiateInternalDependencies(resolvedModulesDependencyModel) {
  _.eachRight(resolvedModulesDependencyModel.sortedInnerModules, function(innerModuleName) {
    var innerModule = resolvedModulesDependencyModel.internalDependencies[innerModuleName];
    var dependencyInstances = instantiateModuleDependencies(resolvedModulesDependencyModel, innerModule);
    var moduleInstance = instantiateModule(innerModule, dependencyInstances);
    innerModule.instance = moduleInstance; 
  });
}

function instantiateModuleDependencies(resolvedModulesDependencyModel, innerModule) {
  return _.map(innerModule.dependencies, function(dependency) {
    if (dependency.isExternal) {
      return resolvedModulesDependencyModel.externalDependencies[dependency.name];
    }
    var moduleModel = resolvedModulesDependencyModel.internalDependencies[dependency.name];
    if (!_.has(moduleModel, 'instance')) {
      throw new Error("Unexpected error. Module '" + dependency.name + "' has not instantiated yet.");
    }
    return moduleModel.instance;
  });
}

function instantiateModule(innerModule, dependencyInstances) {
  return innerModule.controller.apply(undefined, dependencyInstances);
}