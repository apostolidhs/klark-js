/* jshint esversion:6, node:true  */

'use strict';

const _ = require('lodash');
const path = require('path');

const trackApplicationFiles = require('./track-application-files.js');
const moduleDecorator = require('./module-decorator');
const createModulesDependencyGraph = require('./create-modules-dependency-graph');

module.exports = {
  run: runApplication
};

function runApplication(customConfig) {
  const config = customConfig || {};
  _.defaults(config, getDefaultConfig());

  global.klarkConfig = config;
  global[config.registrationModuleName] = moduleDecorator;

  log('begin initialization');
  trackApplicationFiles(config.predicateFilePicker())
    .then(appFiles => createModulesDependencyGraph(config.base, appFiles))
    .then(modulesDependencyGraph => topologicalResolveModulesDependencyGraph(modulesDependencyGraph))
    .then(topologicalSortedModules => instantiateModules(topologicalSortedModules))
    .then(() => log('initialization finished'))
    .catch(reason => handleMajorError(reason));
}

function topologicalResolveModulesDependencyGraph(modulesDependencyGraph) {
  return Promise.resolve();
} 

function instantiateModules(topologicalSortedModules) {
  return Promise.resolve();
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
  console.error(`- Klark: ${reason}`);
  process.exit(1);
}

function log(msg) {
  console.log(`- Klark: ${msg}`);
}