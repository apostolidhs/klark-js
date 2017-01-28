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

  var beginModuleLoadingTimestamp = _.now();
  logger.setLogLevel(config.logLevel);
  logger.middle('Begin initialization');
  return Promise.resolve()
    .then(function() {
      var predicateFiles = config.predicateFilePicker();
      logger.high('Track files with file pattern: ', JSON.stringify(predicateFiles, 0, '\t'));
      return trackApplicationFiles(config.base, predicateFiles);
    })
    .then(function(appFiles) {
      logger.high('Gather all application files: ', JSON.stringify(appFiles, 0, '\t'));
      return gatherModulesModel.gather(config.base, appFiles);
    })
    .then(function(modulesModel) {
      logger.high('Create modules dependency model');
      return createModulesDependencyModel.create(modulesModel);
    })
    .then(function(modulesDependencyModel) {
      logger.high('Resolve modules dependency model');
      return resolveModulesDependencyModel(modulesDependencyModel);
    })
    .then(function(resolvedModulesDependencyModel) {
      logger.high('instantiate modules');
      return instantiateModules.instantiate(resolvedModulesDependencyModel);
    })
    .then(function(modulesModelInstance) {
      logger.high('attach KlarkJS api');
      return klarkApi(modulesModelInstance, config);
    })
    .then(function(klarkApi) {
      logger.middle('Finished modules loading in ' + (_.now() - beginModuleLoadingTimestamp) + ' ms');
      return klarkApi;
    })
    .catch(function(reason) {
      logger.error(reason);
      throw reason;
    });
}