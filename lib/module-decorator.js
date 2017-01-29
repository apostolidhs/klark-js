'use strict';

var _ = require('lodash');

var logger = require('./logger');

module.exports = {
  decorator: moduleDecorator,
  normalizeExternalDependencyName: normalizeExternalDependencyName,
  getParameterNames: getParameterNames,
  isExternalControllerParameterName: isExternalControllerParameterName,
  setConfig: setConfig
};

var config;

function setConfig(_config) {
  config = _config;
}

function moduleDecorator(amd, moduleName, controller) {
  if (!(_.isObject(amd) && amd.exports)) {
    throw new Error('Invalid arguments. ' + config.registrationModuleName + " should be called with 'module' argument");
  }

  if (!(moduleName && _.isFunction(controller))) {
    amd.exports = {
      error: "Invalid arguments on '" + config.registrationModuleName + "'"
    };
    return;
  }

  if (moduleName !== _.camelCase(moduleName)) {
    amd.exports = {
      error: 'Invalid arguments. ' + config.registrationModuleName + " module name should be a camel case string"
    };
    return;
  }

  var parameters = getParameterNames(controller);
  var dependencies = _.map(parameters, exportDependency);

  amd.exports = {
    controller,
    dependencies,
    name: moduleName
  };
}

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;

function getParameterNames(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
  var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  return result === null ? [] : result;
}

function toKebabCaseOnlyCharacters(str) {
  var kebab = '';
  _.each(str, function(c, idx) {
    var nextChar = str[idx + 1];
    kebab += c.toLowerCase();
    if (isAlphaNumericUpperCase(nextChar)) {
      kebab += '-';
    }
  });
  return kebab;
}

function isAlphaNumericUpperCase(c) {
  return c && /^[a-z0-9]+$/i.test(c) && c === c.toUpperCase();
}

function exportDependency(dependency) {
  dependency = config.moduleAlias[dependency] || dependency;
  console.log(dependency)
  var isExternal = isExternalControllerParameterName(dependency);
  var name = isExternal ? normalizeExternalDependencyName(dependency) : dependency;
  return {
    isExternal: isExternal,
    name: name
  };
}

function normalizeExternalDependencyName(dependency) {
    var camelCaseDependency = dependency.substr(1);
    return toKebabCaseOnlyCharacters(camelCaseDependency);
}

function isExternalControllerParameterName(name) {
  return _.startsWith(name, '$');
}