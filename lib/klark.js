'use strict';

var _ = require('lodash');
var path = require('path');

var logger = require('./logger');
var configurationLoader = require('./configuration-loader');
var trackApplicationFiles = require('./track-application-files');
var gatherModulesModel = require('./gather-modules-model');
var createModulesDependencyModel = require('./create-modules-dependency-model');
var resolveModulesDependencyModel = require('./resolve-modules-dependency-model');
var instantiateModules = require('./instantiate-modules');
var klarkApiGenerator = require('./klark-api-generator');

module.exports = {
  run: runApplication
};

function runApplication(customConfig) {
  var config = configurationLoader(customConfig);

  logger.setLogLevel(config.logLevel);
  logger.middle('begin initialization');
  return Promise.resolve()
    .then(function() {
      return trackApplicationFiles(config.base, config.predicateFilePicker());
    })
    .then(function(appFiles) {
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
      logger.middle('initialization finished');
      return klarkApiGenerator(modulesModelInstance);
    })
    .catch(function(reason) {
      logger.error(reason);
      throw reason;
    });
}