'use strict';

var Promise = require('promise');
var _ = require('lodash');
var path = require('path');

var logger = require('./logger');
var configurationLoader = require('./configuration-loader');
var trackApplicationFiles = require('./track-application-files');
var gatherModulesModel = require('./gather-modules-model');
var createModulesDependencyModel = require('./create-modules-dependency-model');
var resolveModulesDependencyModel = require('./resolve-modules-dependency-model');
var instantiateModules = require('./instantiate-modules');
var klarkApi = require('./klark-api');

module.exports = {
  run: runApplication
};

function runApplication(customConfig) {
  var config = configurationLoader(customConfig);

  var begin = _.now();
  logger.setLogLevel(config.logLevel);
  logger.middle('Begin initialization');
  return Promise.resolve()
    .then(function() {
      return trackApplicationFiles(config.base, config.predicateFilePicker());
    })
    .then(function(appFiles) {
      logger.high('Gather all application files: ', JSON.stringify(appFiles, 0, '\t'));
      return gatherModulesModel.gather(config.base, appFiles);
    })
    .then(function(modulesModel) {
      return createModulesDependencyModel.create(modulesModel);
    })
    .then(function(modulesDependencyModel) {
      return resolveModulesDependencyModel(modulesDependencyModel);
    })
    .then(function(resolvedModulesDependencyModel) {
      return instantiateModules.instantiate(resolvedModulesDependencyModel);
    })
    .then(function(modulesModelInstance) {
      logger.middle('Finished initialization in ' + (_.now() - begin) + ' ms');
      return klarkApi(modulesModelInstance);
    })
    .catch(function(reason) {
      logger.error(reason);
      throw reason;
    });
}