/* jshint esversion:6, node:true  */

'use strict';

const _ = require('lodash');

module.exports = moduleDecorator;

function moduleDecorator(amd, moduleName, controller) {
  const dependencies = getParameterNames(controller);
  const categorizedDependencies = _.groupBy(dependencies, d => _.startsWith(d, '$') ? 'libs' : 'inner');

  categorizedDependencies.libs = _.map(categorizedDependencies.libs, lib => {
    const camelCaseDependency = lib.substr(1);
    normalizedDependency = toKebabCaseOnlyCharacters(camelCaseDependency);
    return klarkConfig.moduleAlias[normalizedDependency] || normalizedDependency;
  });

  amd.exports = {
    name: moduleName,
    dependencies: categorizedDependencies
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