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
      return gatherModulesModel(config.base, appFiles);
    })
    .then(function(modulesModel) {
      return createModulesDependencyModel(modulesModel);
    })
    .then(function(modulesDependencyModel) {
      return resolveModulesDependencyModel(modulesDependencyModel);
    })
    .then(function(resolvedModulesDependencyModel) { 
      return instantiateModules(resolvedModulesDependencyModel);
    })
    .then(function() {
      logger.middle('initialization finished');
    })
    .catch(function(reason) {
      logger.error(reason);
      throw reason;
    });
}