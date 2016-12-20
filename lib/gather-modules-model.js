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

function createModulesDependencyModel(base, appFiles) {
  try {
    const modulesModel = _.map(appFiles, appFile => {
      base = base ? base + '/' : '';  
      const absolutePath = base + appFile;
      try {
        const moduleModel = require(absolutePath);
        if (_.isEmpty(moduleModel) || !_.isObject(moduleModel)) {
          throw new Error(`The file '${absolutePath}' seems to be empty`);
        } else if (moduleModel.error) {
          throw new Error(`The file '${absolutePath}' is invalid. More: ${moduleModel.error}`);
        }
        moduleModel.file = appFile;

        return moduleModel;
      } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
          throw new Error(`The file '${absolutePath}' does does not exists`);
        }    
        throw new Error(`The file '${absolutePath}' has unexpected error. Message: ${e.message}. Stack: ${JSON.stringify(e.stack)}`);
      }      
    });
    return Promise.resolve(modulesModel);
  } catch(e) {
    return Promise.reject(e);
  }
}