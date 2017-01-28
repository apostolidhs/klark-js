'use strict';

var _ = require('lodash');
var expect = require('chai').expect;
var configurationLoader = require('../../lib/configuration-loader');

describe('Configuration loader', function() {

  it('Should properly load the default configuration', function() {
    var config = configurationLoader();
    expect(config.predicateFilePicker()).to.deep.equal(['plugins/**/index.js', 'plugins/**/*.module.js']);
  });

  it('Should properly load the custom module name', function() {
    var config = configurationLoader({
      globalRegistrationModuleName: 'myModuleSystem'
    });
    expect(_.isFunction(myModuleSystem)).to.equal(true);
  });
});