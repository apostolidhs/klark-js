/* jshint esversion:6, node:true  */

'use strict';

const _ = require('lodash');

module.exports = moduleDecorator;

function moduleDecorator(amd, moduleName, controller) {
  if (!(_.isObject(amd) 
    && _.isString(moduleName) 
    && moduleName 
    && _.isFunction(controller))
  ) {
    return {error: `Invalid arguments on ${klarkConfig.registrationModuleName}`};
  }

  const parameters = getParameterNames(controller);
  const dependencies = _.map(parameters, exportDependency);

  amd.exports = {
    controller,
    dependencies,
    name: moduleName        
  };
}

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

function getParameterNames(func) {
  const fnStr = func.toString().replace(STRIP_COMMENTS, '');
  const result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  return result === null ? [] : result;
}

function toKebabCaseOnlyCharacters(str) {
  let kebab = '';
  _.each(str, (c, idx) => {
    const nextChar = str[idx + 1];
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
  const isExternal = _.startsWith(dependency, '$');
  let name = dependency;
  if (isExternal) {
    const camelCaseDependency = dependency.substr(1);
    const normalizedDependency = toKebabCaseOnlyCharacters(camelCaseDependency);
    name = klarkConfig.moduleAlias[normalizedDependency] || normalizedDependency;      
  }

  return {isExternal, name};
}