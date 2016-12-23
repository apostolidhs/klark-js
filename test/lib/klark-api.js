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

  it('Should properly get internal modules', function(cb) {
    var klarkPrms = runKlarkOnSamples();
    expectPrms.success(klarkPrms, function(klarkApi) {
      var genInner1 = klarkApi.getModule('normalPluginsPlugin1');
      var externalInner1 = klarkApi.getExternalModule('normalPluginsPlugin1');
      var internalInner1 = klarkApi.getInternalModule('normalPluginsPlugin1');
      expect(genInner1.log).to.equal('plugin1');
      expect(genInner1).to.equal(internalInner1);
      expect(externalInner1).to.equal(undefined);
    }, cb);
  });

  it('Should properly inject an external module', function(cb) {
    var klarkPrms = runKlarkOnSamples();
    expectPrms.success(klarkPrms, function(klarkApi) {
      var globby = klarkApi.injectExternalModule('globby');
      expect(_.isFunction(globby.sync)).to.equal(true);
      var externalGlobby = klarkApi.getExternalModule('globby');
      expect(externalGlobby).to.equal(globby);
    }, cb);
  });

  it('Should properly inject an internal module from metadata', function(cb) {
    var api;
    runKlarkOnSamples()
      .then(function(klarkApi) {
        api = klarkApi;
        return api.injectInternalModuleFromMetadata('injectedPlugin', function($lodash, normalPluginsPlugin1) {
          return {
            log: 'injected',
            _: $lodash,
            normalPluginsPlugin1: normalPluginsPlugin1
          };
        });
      }).then(function(instance) {
        expect(instance.log).to.equal('injected');
        var internalPlug = api.getInternalModule('injectedPlugin');
        expect(internalPlug).to.equal(instance);
      })
      .then(function() { cb(); })
      .catch(function(reason) { cb(reason); });
  });

  it('Should properly get the application dependencies graph', function(cb) {
    var klarkPrms = runKlarkOnSamples();
    expectPrms.success(klarkPrms, function(klarkApi) {
      var dependenciesGraph = klarkApi.getApplicationDependenciesGraph();
      expect(_.keys(dependenciesGraph)).to.deep.equal(['normalPluginsPlugin1', 'normalPluginsPlugin2', 'normalPluginsPlugin3']);
      expect(dependenciesGraph.normalPluginsPlugin1).to.deep.equal([{
          isExternal: true,
          name: 'lodash'
      }]);
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