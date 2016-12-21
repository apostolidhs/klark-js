'use strict';

var _ = require('lodash');

module.exports = moduleDecorator;

function moduleDecorator(amd, moduleName, controller) {
  if (!(_.isObject(amd) 
    && _.isString(moduleName) 
    && moduleName 
    && _.isFunction(controller))
  ) {
    return {error: "Invalid arguments on '" + klarkConfig.registrationModuleName + "'"};
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
  var isExternal = _.startsWith(dependency, '$');
  var name = dependency;
  if (isExternal) {
    var camelCaseDependency = dependency.substr(1);
    var normalizedDependency = toKebabCaseOnlyCharacters(camelCaseDependency);
    name = klarkConfig.moduleAlias[normalizedDependency] || normalizedDependency;      
  }

  return {
    isExternal: isExternal, 
    name: name
  };
}