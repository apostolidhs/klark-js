'use strict';

var expect = require('chai').expect;
var path = require('path');
var _ = require('lodash');

var expectPrms = require('../utilities/expect-promise');
var klark = require('../../lib/klark');
var klarkApi = require('../../lib/klark-api');

describe('Normal plugins', function() {
  it('Should reject on invalid parameters', function(cb) {
    expectPrms.invalidParameters(klarkApi(), cb);
  });

  it('Should instantiate the normal-plugins application', function(cb) {
    var klarkPrms = runKlarkOnSamples();
    expectPrms.success(klarkPrms, _.noop, cb);
  });

  it('Should properly get external modules', function(cb) {
    var klarkPrms = runKlarkOnSamples();
    expectPrms.success(klarkPrms, function(klarkApi) {
      // var genLodash = klarkApi.getModule('$lodash');
      // var externalLodashAlias = klarkApi.getExternalModule('$_');
      // var externalLodashArg = klarkApi.getExternalModule('$lodash');
      // var internalLodash = klarkApi.getInternalModule('lodash');

      // expect(genLodash).to.equal(_);
      // expect(genLodash).to.equal(externalLodashAlias);
      // expect(genLodash).to.equal(externalLodashArg);

      // expect(internalLodash).to.equal(undefined);
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
      var externalPromiseBefore = klarkApi.getExternalModule('$promise');
      expect(externalPromiseBefore).to.equal(undefined);
      var promise = klarkApi.injectExternalModule('$promise');
      expect(_.isFunction(promise.resolve)).to.equal(true);
      var externalPromiseAfter = klarkApi.getExternalModule('$promise');
      expect(externalPromiseAfter).to.equal(promise);
    }, cb);
  });

  it('Should properly inject an internal module from metadata', function(cb) {
    var api;
    var klarkPrms = runKlarkOnSamples()
      .then(function(klarkApi) {
        api = klarkApi;
        return api.injectInternalModuleFromMetadata('injectedPlugin', function($lodash, normalPluginsPlugin1) {
          return {
            log: 'injected',
            _: $lodash,
            normalPluginsPlugin1: normalPluginsPlugin1
          };
        });
      });
    expectPrms.success(klarkPrms, function(instance) {
        expect(instance.log).to.equal('injected');
        var internalPlug = api.getInternalModule('injectedPlugin');
        expect(internalPlug).to.equal(instance);
      }, cb);
  });

  it('Should properly inject an internal module from filepath', function(cb) {
    var api;
    var klarkPrms = runKlarkOnSamples()
      .then(function(klarkApi) {
          api = klarkApi;
          return api.injectInternalModuleFromFilepath(klarkApi.config.base + '/test/samples/atom.js');
      });
    expectPrms.success(klarkPrms, function(instance) {
        expect(instance.log).to.equal('atom');
        var internalPlug = api.getInternalModule('atom');
        expect(internalPlug).to.equal(instance);
      }, cb);
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
        var modules = 'test/samples/normal-plugins/**/index.js';
        var subModules = 'test/samples/normal-plugins/**/*.module.js';
        return [modules, subModules];
      }
    });
  }

});