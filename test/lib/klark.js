var _ = require('lodash');
var expect = require('chai').expect;

var expectPrms = require('../utilities/expect-promise');
var klark = require('../../lib/klark');

describe('Klark', function() {

  it('Should properly include 1 orphan dependencies', function(cb) {
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

  it('Should properly include 3 orphan dependencies', function(cb) {
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

});