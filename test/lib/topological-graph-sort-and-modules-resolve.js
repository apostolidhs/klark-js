'use strict';

var expect = require('chai').expect;
var path = require('path');
var expectPrms = require('../utilities/expect-promise');
var resolveModulesDependencyModel = require('../../lib/resolve-modules-dependency-model');

describe('Resolve modules dependency model', function() {
  it('Should reject on invalid parameters', function(cb) {
    expectPrms.invalidParameters(resolveModulesDependencyModel(), cb);
  })
});