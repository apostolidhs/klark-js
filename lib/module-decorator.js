'use strict';

var _ = require('lodash');

var logger = require('./logger');

module.exports = {
  decorator: moduleDecorator,
  normalizeExternalDependencyName: normalizeExternalDependencyName,
  resolveDependencyName: resolveDependencyName,
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
  const resolvedName = resolveDependencyName(dependency);
  var isExternal = isExternalControllerParameterName(resolvedName);
  var name = isExternal ? normalizeExternalDependencyName(resolvedName) : resolvedName;
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

function resolveDependencyName(dependency) {
  if(dependency[0] === '_'
    && _.endsWith(dependency, '_')
    && dependency.length > 2
  ) {
    dependency = dependency.substr(1, dependency.length - 2);
  }
  return config.moduleAlias[dependency] || dependency;
}