'use strict';

var Promise = require('promise');
var _ = require('lodash');

var moduleDecorator = require('./module-decorator');
var gatherModulesModel = require('./gather-modules-model');
var createModulesDependencyModel = require('./create-modules-dependency-model');
var instantiateModules = require('./instantiate-modules');

module.exports = klarkApi;

function klarkApi(modulesModelInstance) {
  if (!(_.isObject(modulesModelInstance)
    && _.isArray(modulesModelInstance.sortedInnerModules)
    && _.isObject(modulesModelInstance.internalDependencies)
    && _.isObject(modulesModelInstance.externalDependencies)
  )) {
    return Promise.reject('klarkApi: Invalid parameters');
  }

  return {
    getModule: getModule,
    getInternalModule: getInnerModule,
    getExternalModule: getExternalModule,
    injectInternalModuleFromMetadata: injectInternalModuleFromMetadata,
    injectInternalModuleFromFilepath: injectInternalModuleFromFilepath,
    injectExternalModule: injectExternalModule,
    getApplicationDependenciesGraph: getApplicationDependenciesGraph
  };

  function getModule(name) {
    validateStringParameter(name);

    return getInnerModule(name) || getExternalModule(name);
  }

  function getInnerModule(name) {
    validateStringParameter(name);

    return modulesModelInstance.internalDependencies[name]
        && modulesModelInstance.internalDependencies[name].instance;
  }

  function getExternalModule(name) {
    validateStringParameter(name);

    var externalModuleName = name;
    if (moduleDecorator.isExternalControllerParameterName(name)) {
      externalModuleName = exportDependency(name).name;
    }
    return modulesModelInstance.externalDependencies[externalModuleName];
  }

  function injectExternalModule(name) {
    validateStringParameter(name);
    instantiateModules.instantiateExternalDependencies(_.fromPairs([[name, true]]));
    return getExternalModule(name);
  }

  function injectInternalModuleFromMetadata(moduleName, controller) {
    return injectInternalModule(moduleName, function() {
      var amd = {exports: {}};
      moduleDecorator.decorator(amd, moduleName, controller);
      return amd.exports;
    });
  }

  function injectInternalModuleFromFilepath(filepath) {
    return injectInternalModule(filepath, function() {
      return require(filepath);
    });
  }

  function getApplicationDependenciesGraph() {
    return _.transform(modulesModelInstance.internalDependencies, function(appDepends, innerModule) {
      appDepends[innerModule.name] = _.cloneDeep(innerModule.dependencies);
    }, {});
  }

  function injectInternalModule(moduleName, moduleFetcher) {
    try {
      var moduleModel = gatherModulesModel.tryLoadModule(moduleName, moduleFetcher);
      moduleModel.isInjected = true;
      createModulesDependencyModel.addModuleDependencyModel(modulesModelInstance, moduleModel);
      instantiateModules.instantiateInternalDependencies(modulesModelInstance, [moduleName]);
      var moduleInstance = getInnerModule(moduleName);
      return Promise.resolve(moduleInstance);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  function validateStringParameter(param) {
    if (!_.isString(param) || !param) {
      throw new Error('invalid arguments');
    }
  }

}
