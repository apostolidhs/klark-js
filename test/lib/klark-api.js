'use strict';

var expect = require('chai').expect;
var path = require('path');
var _ = require('lodash');

var expectPrms = require('../utilities/expect-promise');
var klark = require('../../lib/klark');

describe('Normal plugins', function() {

  it('Should instantiate the normal-plugins application', function(cb) {
    var klarkPrms = runKlarkOnSamples();
    expectPrms.success(klarkPrms, _.noop, cb);
  });

  it('Should properly get external modules', function(cb) {
    var klarkPrms = runKlarkOnSamples();
    expectPrms.success(klarkPrms, function(klarkApi) {
      var genLodash = klarkApi.getModule('lodash');
      var externalLodash = klarkApi.getExternalModule('lodash');
      var internalLodash = klarkApi.getInternalModule('lodash');
      expect(genLodash).to.equal(externalLodash);
      expect(externalLodash).to.equal(_);
      expect(internalLodash).to.equal(undefined);
    }, cb);
  });

  function runKlarkOnSamples() {
    return klark.run({
      predicateFilePicker: function() {
        var modules = `test/samples/normal-plugins/**/index.js`;
        var subModules = `test/samples/normal-plugins/**/*.module.js`;
        return [modules, subModules];
      }
    });
  }

});