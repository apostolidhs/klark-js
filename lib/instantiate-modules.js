/* jshint esversion:6, node:true  */

'use strict';

const _ = require('lodash');

module.exports = instantiateModules;

function instantiateModules(resolvedModulesDependencyModel) {
  instantiateExternalDependencies(resolvedModulesDependencyModel.externalDependencies);
  instantiateInternalDependencies(resolvedModulesDependencyModel);
}

function instantiateExternalDependencies(externalDependencies) {
  _.each(externalDependencies, (truly, externalDependency) => {
    try {
      externalDependencies[externalDependency] = require(externalDependency);
    } catch (e) {
      throw new Error(`Error on External library '${externalDependency}'. ${e.message}. ${e.stack}`);
    }
  });
}

function instantiateInternalDependencies(resolvedModulesDependencyModel) {

}