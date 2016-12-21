'use strict';

var expect = require('chai').expect;
var path = require('path');
var _ = require('lodash');

var klark = require('../index');
var expectPrms = require('./utilities/expect-promise');

describe('Normal plugins', function() {

  it('Should instantiate the normal-plugins application', function(cb) {
    var klarkPrms = klark.run({
      predicateFilePicker: function() {
        var modules = `test/samples/normal-plugins/**/index.js`;
        var subModules = `test/samples/normal-plugins/**/*.module.js`;
        return [modules, subModules];
      }
    });  
    expectPrms.success(klarkPrms, _.noop, cb);          
  });

});