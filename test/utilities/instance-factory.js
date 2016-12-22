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
      inner1: [],
      inner3: ['inner1', 'inner2'],
      inner2: ['inner1']
    },
    internalDependencies: {
      inner1: {
        controller: function($lodash) {
          return {
            args: [].slice.call(arguments),
            name: 'inner1'
          };
        },
        dependencies: [
          {
            isExternal: true,
            name: 'lodash'
          }
        ],
        name: 'inner1'
      },
      inner2: {
        controller: function(inner1) {
          return {
            args: [].slice.call(arguments),
            name: 'inner2'
          };
        },
        dependencies: [
          {
            isExternal: false,
            name: 'inner1'
          }
        ],
        name: 'inner2'
      },
      inner3: {
        controller: function(inner1, inner2) {
          return {
            args: [].slice.call(arguments),
            name: 'inner3'
          };
        },
        dependencies: [
          {
            isExternal: false,
            name: 'inner1'
          },
          {
            isExternal: false,
            name: 'inner2'
          }
        ],
        name: 'inner3'
      }
    },
    externalDependencies: {
      lodash: true
    },
    sortedInnerModules: ['inner3', 'inner2', 'inner1']
  };
}