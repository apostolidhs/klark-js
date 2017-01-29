var _ = require('lodash');
var expect = require('chai').expect;

var expectPrms = require('../utilities/expect-promise');
var klark = require('../../lib/klark');

describe('Klark', function() {

  it('Should include 1 orphan dependencies', function(cb) {
    var klarkPrms =  klark.run({
      predicateFilePicker: function() {
        return ['test/samples/orphan-plugins/1/**/*.js'];
      }
    });
    expectPrms.success(klarkPrms, function(klarkApi) {
      var innerModules = _.keys(klarkApi.getApplicationDependenciesGraph());
      expect(innerModules).to.deep.equal(['a']);
    }, cb);
  });

  it('Should include 3 orphan dependencies', function(cb) {
    var klarkPrms =  klark.run({
      predicateFilePicker: function() {
        return ['test/samples/orphan-plugins/3/**/*.js'];
      }
    });
    expectPrms.success(klarkPrms, function(klarkApi) {
      var innerModules = _.keys(klarkApi.getApplicationDependenciesGraph());
      expect(innerModules).to.deep.equal(['a', 'b', 'c']);
    }, cb);
  });

  it('Should load module with configured module/config name', function(cb) {
    delete global['KlarkModule'];
    var klarkPrms =  klark.run({
      predicateFilePicker: function() {
        return ['test/samples/klark-configured-names-changed/**/*.js'];
      },
      globalRegistrationModuleName : 'MyModule'
    });
    expectPrms.success(klarkPrms, function(klarkApi) {
      var a = klarkApi.getInternalModule('a');
      expect(!a).to.equal(false);
    }, cb);
  });

  it('Should find missing dependencies', function(cb) {
    var klarkPrms =  klark.run({
      predicateFilePicker: function() {
        return ['test/samples/missing-dependencies/**/*.js'];
      }
    });
    expectPrms.fail(klarkPrms, function(reason) {
      expect(reason + '').to.contain('The module \'b\' that is required on (a) does not exist');
    }, cb);
  });

});