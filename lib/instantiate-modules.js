'use strict';

var Promise = require('promise');
var _ = require('lodash');

var logger = require('./logger');

module.exports = {
  instantiate: instantiateModules,
  instantiateExternalDependencies: instantiateExternalDependencies,
  instantiateInternalDependencies: instantiateInternalDependencies
};

//instantiateModules;

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
    instantiateInternalDependencies(resolvedModulesDependencyModel, resolvedModulesDependencyModel.sortedInnerModules);
    return Promise.resolve(resolvedModulesDependencyModel);
  } catch(e) {
    return Promise.reject(e);
  }
}

function instantiateExternalDependencies(externalDependencies) {
  logger.high('Begin instantiation of external libraries');
  _.each(externalDependencies, function(truly, externalDependency) {
    try {
      logger.high("Instantiate external library '" + externalDependency + "'");
      externalDependencies[externalDependency] = require(externalDependency);
    } catch (e) {
      throw new Error(['Error on External library ', externalDependency, '. ', e.message, '. ', e.stack].join(''));
    }
  });
  logger.high('Finished instantiation of external libraries');
}

function instantiateInternalDependencies(resolvedModulesDependencyModel, innerModules) {
  logger.high('Begin instantiation of internal libraries');
  _.eachRight(innerModules, function(innerModuleName) {
    logger.high("Instantiate internal library '" + innerModuleName + "'");
    var innerModule = resolvedModulesDependencyModel.internalDependencies[innerModuleName];
    var dependencyInstances = instantiateModuleDependencies(resolvedModulesDependencyModel, innerModule);
    var moduleInstance = instantiateModule(innerModule, dependencyInstances);
    innerModule.instance = moduleInstance;
  });
  logger.high('Finished instantiation of internal libraries');
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