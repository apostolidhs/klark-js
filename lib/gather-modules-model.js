'use strict';

var _ = require('lodash');

module.exports = gatherModulesModel;

function gatherModulesModel(base, appFiles) {
  if (!(_.isString(base) && _.isArray(appFiles))) {
    return Promise.reject('gatherModulesModel: Invalid parameters');
  }

  base = base ? base + '/' : '';
  try {
    var modulesModel = _.map(appFiles, function(appFile) {
      return loadModule(base, appFile);      
    });
    return Promise.resolve(modulesModel);
  } catch(e) {
    return Promise.reject(e);
  }
}

function loadModule(base, appFile) {
  var absolutePath = base + appFile;
  var moduleModel;
  try {
    moduleModel = require(absolutePath);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      throw new Error(["The file '", absolutePath, "' does not exists"].join(''));
    }    
    throw new Error(["The file '", absolutePath, "' has unexpected error. Message: ", e.message, ". Stack: ", JSON.stringify(e.stack)].join(''));
  }      
  if (_.isEmpty(moduleModel) || !_.isObject(moduleModel)) {
    throw new Error(["The file '", absolutePath, "' seems to be empty"].join(''));
  } else if (moduleModel.error) {
    throw new Error(["The file '", absolutePath, "' is invalid. More: ", moduleModel.error].join(''));
  }
  moduleModel.file = appFile;

  return moduleModel;  
}