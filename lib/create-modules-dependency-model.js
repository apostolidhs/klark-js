/* jshint esversion:6, node:true  */

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

const _ = require('lodash');

module.exports = createModulesDependencyModel;

function createModulesDependencyModel(modulesModel) {
  const internalDependencyNamesGraph = {};
  const internalDependencies = {};
  const externalDependencies = {};

  try {
    _.each(modulesModel, moduleModel => {
      const name = moduleModel.name;
      if (internalDependencies[name]) {
        throw new Error(`Module duplication. Module '${name}' has declared twice: ('${internalDependencies[name].file}', '${moduleModel.file}')`);
      }
      internalDependencies[name] = moduleModel;
          
      const dependencies = internalDependencyNamesGraph[name] 
                            || (internalDependencyNamesGraph[name] = []);
      _.each(moduleModel.dependencies, dependency => {
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

  const modulesDependencyModel = {
    internalDependencyNamesGraph, 
    internalDependencies, 
    externalDependencies
  };
  
  return Promise.resolve(modulesDependencyModel);
}
