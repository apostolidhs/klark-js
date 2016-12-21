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

module.exports = createModulesDependencyModel;

function createModulesDependencyModel(modulesModel) {
  if (!_.isArray(modulesModel)) {
    return Promise.reject('createModulesDependencyModel: Invalid parameters');
  }

  var internalDependencyNamesGraph = {};
  var internalDependencies = {};
  var externalDependencies = {};

  try {
    _.each(modulesModel, function(moduleModel) {
      var name = moduleModel.name;
      if (internalDependencies[name]) {
        throw new Error(["Module duplication. Module '", name, "' has declared twice: ('", internalDependencies[name].file, "', '", moduleModel.file, "')"].join(''));
      }
      internalDependencies[name] = moduleModel;
          
      var dependencies = internalDependencyNamesGraph[name] 
                            || (internalDependencyNamesGraph[name] = []);
      _.each(moduleModel.dependencies, function(dependency) {
        if (dependency.isExternal) {
          externalDependencies[dependency.name] = true;
        } else {
          dependencies.push(dependency.name);
        }
      });  
    }); 
  } catch (e) {
    return Promise.reject(e);
  }

  var modulesDependencyModel = {
    internalDependencyNamesGraph: internalDependencyNamesGraph, 
    internalDependencies: internalDependencies, 
    externalDependencies: externalDependencies
  };
  
  return Promise.resolve(modulesDependencyModel);
}
