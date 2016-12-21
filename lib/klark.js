/* jshint esversion:6, node:true  */

'use strict';

const _ = require('lodash');
const path = require('path');

const logger = require('./logger');
const trackApplicationFiles = require('./track-application-files');
const moduleDecorator = require('./module-decorator');
const gatherModulesModel = require('./gather-modules-model');
const createModulesDependencyModel = require('./create-modules-dependency-model');
const resolveModulesDependencyModel = require('./resolve-modules-dependency-model');
const instantiateModules = require('./instantiate-modules');

module.exports = {
  run: runApplication
};

function runApplication(customConfig) {
  const config = customConfig || {};
  _.defaults(config, getDefaultConfig());

  global.klarkConfig = config;
  global[config.registrationModuleName] = moduleDecorator;

  logger.middle('begin initialization');
  return trackApplicationFiles(config.predicateFilePicker())
    .then(appFiles => gatherModulesModel(config.base, appFiles))
    .then(modulesModel => createModulesDependencyModel(modulesModel))
    .then(modulesDependencyModel => resolveModulesDependencyModel(modulesDependencyModel))
    .then(resolvedModulesDependencyModel => instantiateModules(resolvedModulesDependencyModel))
    .then(() => logger.middle('initialization finished'))
    .catch(reason => {
      handleMajorError(reason);
      throw reason;
    });
}

function getDefaultConfig() {
  return {
    predicateFilePicker: () => {
      const modules = `plugins/**/index.js`;
      const subModules = `plugins/**/*.module.js`;
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
  logger.error(`- Klark: ${reason}`);
}