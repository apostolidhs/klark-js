/* jshint esversion:6, node:true  */

'use strict';

const expect = require('chai').expect;
const path = require('path');
const klark = require('../index');

describe('Normal plugins', () => {

  it('a normal user create account', cb => {
    klark.run({
      predicateFilePicker: () => {
        const modules = `test/normal-plugins/**/index.js`;
        const subModules = `test/normal-plugins/**/*.module.js`;
        return [modules, subModules];
      },
      base: path.join(__dirname, '../')
    })
    .then(() => cb())
    .catch(reason => cb(reason))      
  });

});