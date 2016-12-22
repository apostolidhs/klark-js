'use strict';

var _ = require('lodash');
var expect = require('chai').expect;
var path = require('path');
var expectPrms = require('../utilities/expect-promise');
var instanceFactory = require('../utilities/instance-factory');
var instantiateModules = require('../../lib/instantiate-modules');

describe('Instantiate modules', function() {
  it('Should reject on invalid parameters', function(cb) {
    expectPrms.invalidParameters(instantiateModules.instantiate(), cb);
  });

  it('Should successfully instantiate the modules', function(cb) {
    expectPrms.success(
      instantiateModules.instantiate(instanceFactory.getModulesDependencyModel()), function(modulesModelInstance) {
        var internal = modulesModelInstance.internalDependencies;
        expect(modulesModelInstance.externalDependencies['lodash']).to.equal(_);
        expect(internal['inner1'].instance).to.deep.equal({
          args: [_],
          name: 'inner1'
        });
        expect(internal['inner2'].instance).to.deep.equal({
          args: [internal['inner1'].instance],
          name: 'inner2'
        });
        expect(internal['inner3'].instance).to.deep.equal({
          args: [
            internal['inner1'].instance,
            internal['inner2'].instance
          ],
          name: 'inner3'
        });
      },
      cb
    );
  });
});