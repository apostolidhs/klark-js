'use strict';

var expect = require('chai').expect;
var path = require('path');
var klark = require('../index');

describe('Normal plugins', function() {

  it('a normal user create account', function(cb) {
    klark.run({
      predicateFilePicker: function() {
        var modules = `test/normal-plugins/**/index.js`;
        var subModules = `test/normal-plugins/**/*.module.js`;
        return [modules, subModules];
      },
      base: path.join(__dirname, '../')
    })
    .then(function() { cb(); })
    .catch(function(reason) { cb(reason); });      
  });

});