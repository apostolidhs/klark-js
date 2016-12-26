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
      return [
        'plugins/**/index.js',
        'plugins/**/*.module.js'
      ];
    },
    globalRegistrationModuleName: 'KlarkModule',
    globalConfigurationName: 'KlarkConfig',
    base: process.cwd(),
    logLevel: 'off',
    moduleAlias: {
      '_': 'lodash'
    }
  };
}