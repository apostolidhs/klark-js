'use strict';

var _ = require('lodash');

var moduleDecorator = require('./module-decorator');

module.exports = configurationLoader;

function configurationLoader(customConfig) {
  var config = customConfig || {};
  _.defaults(config, getDefaultConfig());

  global.klarkConfig = config;
  global[config.registrationModuleName] = moduleDecorator.decorator;

  return config;
}

function getDefaultConfig() {
  return {
    predicateFilePicker: function() {
      var modules = `plugins/**/index.js`;
      var subModules = `plugins/**/*.module.js`;
      return [modules, subModules];
    },
    registrationModuleName: 'klarkModule',
    base: process.cwd(),
    logLevel: 'low',
    moduleAlias: {
      '_': 'lodash'
    }
  };
}