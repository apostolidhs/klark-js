/*
  Dependency model:

  internalGraph:
  {
    inner1: [inner2, inner3],
    inner3: [inner2]
  }

  internal:
  {
    inner1: dependencyModel1,
    inner2: dependencyModel2,
    inner3: dependencyModel3
  }

  external:
  {
    externalLib1: true,
    externalLib2: true
  }
*/

'use strict';

var _ = require('lodash');

module.exports = {
  create: createModulesDependencyModel,
  addModuleDependencyModel: addModuleDependencyModel
};

function createModulesDependencyModel(modulesModel) {
  if (!_.isArray(modulesModel)) {
    return Promise.reject('createModulesDependencyModel: Invalid parameters');
  }

  var modulesDependencyModel = {
    internalDependencyNamesGraph: {},
    internalDependencies: {},
    externalDependencies: {}
  };

  try {
    _.each(modulesModel, function(moduleModel) {
      addModuleDependencyModel(modulesDependencyModel, moduleModel);
    });
  } catch (e) {
    return Promise.reject(e);
  }

  return Promise.resolve(modulesDependencyModel);
}

function addModuleDependencyModel(modulesDependencyModel, moduleModel) {
  var name = moduleModel.name;
  if (modulesDependencyModel.internalDependencies[name]) {
    throw new Error(["Module duplication. Module '", name, "' has declared twice: ('",
      modulesDependencyModel.internalDependencies[name].file, "', '", moduleModel.file, "')"].join(''));
  }
  modulesDependencyModel.internalDependencies[name] = moduleModel;

  var dependencies = modulesDependencyModel.internalDependencyNamesGraph[name]
                        || (modulesDependencyModel.internalDependencyNamesGraph[name] = []);
  _.each(moduleModel.dependencies, function(dependency) {
    if (dependency.isExternal) {
      modulesDependencyModel.externalDependencies[dependency.name] = true;
    } else {
      dependencies.push(dependency.name);
    }
  });
}
