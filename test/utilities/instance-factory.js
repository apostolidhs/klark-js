'use strict';

var _ = require('lodash');

module.exports = {
  getNormalPluginPaths: getNormalPluginPaths,
  getModulesModel: getModulesModel,
  getDuplicatedModulesModel: getDuplicatedModulesModel,
  getModulesDependencyModel: getModulesDependencyModel
};

function getNormalPluginPaths() {
  return [
    'test/samples/normal-plugins/plugin1/index.js',
    'test/samples/normal-plugins/plugin2/index.js',
    'test/samples/normal-plugins/plugin3/index.js'
  ];
}

function getModulesModel() {
  return [
    {
      controller: _.noop,
      dependencies: [
        {
          isExternal: true,
          name: 'external-1'
        }
      ],
      name: 'inner1'
    },
    {
      controller: _.noop,
      dependencies: [
        {
          isExternal: false,
          name: 'inner1'
        }
      ],
      name: 'inner2'
    }
  ];
}

function getDuplicatedModulesModel() {
  return [
    {
      controller: _.noop,
      dependencies: [],
      name: 'inner1'
    },
    {
      controller: _.noop,
      dependencies: [],
      name: 'inner1'
    }
  ];
}

function getModulesDependencyModel() {
  return {
    internalDependencyNamesGraph: {

    },
    internalDependencies: {

    },
    externalDependencies: {

    }
  };
}