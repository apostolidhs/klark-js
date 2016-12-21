/* jshint esversion:6, node:true  */

'use strict';

const _ = require('lodash');

module.exports = instantiateModules;

function instantiateModules(resolvedModulesDependencyModel) {
  instantiateExternalDependencies(resolvedModulesDependencyModel.externalDependencies);
  instantiateInternalDependencies(resolvedModulesDependencyModel);
}

function instantiateExternalDependencies(externalDependencies) {
  _.each(externalDependencies, (truly, externalDependency) => {
    try {
      externalDependencies[externalDependency] = require(externalDependency);
    } catch (e) {
      throw new Error(`Error on External library '${externalDependency}'. ${e.message}. ${e.stack}`);
    }
  });
}

function instantiateInternalDependencies(resolvedModulesDependencyModel) {
  _.eachRight(resolvedModulesDependencyModel.sortedInnerModules, innerModuleName => {
    const innerModule = resolvedModulesDependencyModel.internalDependencies[innerModuleName];
    const dependencyInstances = instantiateModuleDependencies(resolvedModulesDependencyModel, innerModule);
    const moduleInstance = instantiateModule(innerModule, dependencyInstances);
    innerModule.instance = moduleInstance; 
  });
}

function instantiateModuleDependencies(resolvedModulesDependencyModel, innerModule) {
  return _.map(innerModule.dependencies, dependency => {
    if (dependency.isExternal) {
      return resolvedModulesDependencyModel.externalDependencies[dependency.name];
    }
    const moduleModel = resolvedModulesDependencyModel.internalDependencies[dependency.name];
    if (!_.has(moduleModel, 'instance')) {
      throw new Error(`Unexpected error. Module '${dependency.name}' has not instantiated yet.`);
    }
    return moduleModel.instance;
  });
}

function instantiateModule(innerModule, dependencyInstances) {
  return innerModule.controller.apply(undefined, dependencyInstances);
}