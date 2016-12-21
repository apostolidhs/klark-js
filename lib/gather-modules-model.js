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

function createModulesDependencyModel(base, appFiles) {
  try {
    var modulesModel = _.map(appFiles, function(appFile) {
      base = base ? base + '/' : '';  
      var absolutePath = base + appFile;
      try {
        var moduleModel = require(absolutePath);
        if (_.isEmpty(moduleModel) || !_.isObject(moduleModel)) {
          throw new Error(["The file '", absolutePath, "' seems to be empty"].join(''));
        } else if (moduleModel.error) {
          throw new Error(["The file '", absolutePath, "' is invalid. More: ", moduleModel.error].join(''));
        }
        moduleModel.file = appFile;

        return moduleModel;
      } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
          throw new Error(["The file '", absolutePath, "' does does not exists"].join(''));
        }    
        throw new Error(["The file '", absolutePath, "' has unexpected error. Message: ", e.message, ". Stack: ", JSON.stringify(e.stack)].join(''));
      }      
    });
    return Promise.resolve(modulesModel);
  } catch(e) {
    return Promise.reject(e);
  }
}