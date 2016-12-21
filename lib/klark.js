'use strict';

var _ = require('lodash');
var path = require('path');

var logger = require('./logger');
var trackApplicationFiles = require('./track-application-files');
var moduleDecorator = require('./module-decorator');
var gatherModulesModel = require('./gather-modules-model');
var createModulesDependencyModel = require('./create-modules-dependency-model');
var resolveModulesDependencyModel = require('./resolve-modules-dependency-model');
var instantiateModules = require('./instantiate-modules');

module.exports = {
  run: runApplication
};

function runApplication(customConfig) {
  var config = customConfig || {};
  _.defaults(config, getDefaultConfig());

  global.klarkConfig = config;
  global[config.registrationModuleName] = moduleDecorator;

  logger.middle('begin initialization');
  return trackApplicationFiles(config.predicateFilePicker())
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
      handleMajorError(reason);
      throw reason;
    });
}

function getDefaultConfig() {
  return {
    predicateFilePicker: function() {
      var modules = `plugins/**/index.js`;
      var subModules = `plugins/**/*.module.js`;
      return [modules, subModules];
    },
    registrationModuleName: 'klarkModule',
    base: path.join(__dirname, '../../..'),
    moduleAlias: {
      '_': 'lodash'
    }
  };
}

function handleMajorError(reason) {
  logger.error(reason);
}