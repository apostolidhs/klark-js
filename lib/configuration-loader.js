'use strict';

var _ = require('lodash');

var moduleDecorator = require('./module-decorator');

module.exports = configurationLoader;

function configurationLoader(customConfig) {
  var config = customConfig || {};
  _.defaults(config, getDefaultConfig());

  global[config.globalConfigurationName] = config;
  global[config.globalRegistrationModuleName] = moduleDecorator.decorator;

  return config;
}

function getDefaultConfig() {
  return {
    predicateFilePicker: function() {
      var modules = 'plugins/**/index.js';
      var subModules = 'plugins/**/*.module.js';
      return [modules, subModules];
    },
    globalRegistrationModuleName: 'klarkModule',
    globalConfigurationName: 'klarkConfig',
    base: process.cwd(),
    logLevel: 'off',
    moduleAlias: {
      '_': 'lodash'
    }
  };
}