'use strict';

var _ = require('lodash');

module.exports = instantiateModules;

function instantiateModules(resolvedModulesDependencyModel) {
  if (!(_.isObject(resolvedModulesDependencyModel)
    && _.isArray(resolvedModulesDependencyModel.sortedInnerModules)
    && _.isObject(resolvedModulesDependencyModel.internalDependencies)
    && _.isObject(resolvedModulesDependencyModel.externalDependencies)
  )) {
    return Promise.reject('resolveModulesDependencyModel: Invalid parameters');
  }
  try {
    instantiateExternalDependencies(resolvedModulesDependencyModel.externalDependencies);
    instantiateInternalDependencies(resolvedModulesDependencyModel);
    return Promise.resolve(resolvedModulesDependencyModel);
  } catch(e) {
    return Promise.reject(e);
  }
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
  try {
    return innerModule.controller.apply(undefined, dependencyInstances);
  } catch (e) {
    throw new Error(["The module '", innerModule.name, "' throw an error during the instantiation.", 'Message: ', e.message, ' Stack: ', e.stack].join(''));
  }
}