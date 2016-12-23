'use strict';

var Promise = require('promise');
var _ = require('lodash');

module.exports = {
  gather: gatherModulesModel,
  tryLoadModule: tryLoadModule
};

function gatherModulesModel(base, appFiles) {
  if (!(_.isString(base) && _.isArray(appFiles))) {
    return Promise.reject('gatherModulesModel: Invalid parameters');
  }

  base = base ? base + '/' : '';
  try {
    var modulesModel = _.map(appFiles, function(appFile) {
      var absolutePath = base + appFile;
      return tryLoadModule(absolutePath, function() {
        return require(absolutePath);
      });
    });
    return Promise.resolve(modulesModel);
  } catch(e) {
    return Promise.reject(e);
  }
}

function tryLoadModule(filename, loader) {
  var moduleModel;
  try {
    moduleModel = loader();
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      throw new Error(["The file '", filename, "' does not exists"].join(''));
    }
    throw new Error(["The file '", filename, "' has unexpected error. Message: ", e.message, ". Stack: ", JSON.stringify(e.stack)].join(''));
  }
  if (_.isEmpty(moduleModel) || !_.isObject(moduleModel)) {
    throw new Error(["The file '", filename, "' seems to be empty"].join(''));
  } else if (moduleModel.error) {
    throw new Error(["The file '", filename, "' is invalid. More: ", moduleModel.error].join(''));
  }
  moduleModel.file = filename;
  return moduleModel;
}