'use strict';

var _ = require('lodash');
var expect = require('chai').expect;
var path = require('path');

var instanceFactory = require('../utilities/instance-factory');
var expectPrms = require('../utilities/expect-promise');
var createModulesDependencyModel = require('../../lib/create-modules-dependency-model');

describe('Create modules dependency model', function() {
  it('Should reject on invalid parameters', function(cb) {
    expectPrms.invalidParameters(createModulesDependencyModel(), cb);
  });

  it('Should create empty structures on empty argument', function(cb) {
    expectPrms.success(
      createModulesDependencyModel([]), function(modulesDependencyModel) {
        expect(modulesDependencyModel.internalDependencyNamesGraph).to.deep.equal({});
        expect(modulesDependencyModel.internalDependencies).to.deep.equal({});
        expect(modulesDependencyModel.externalDependencies).to.deep.equal({});
      },
      cb
    );
  });

  it('Should create a valid modulesDependencyModel', function(cb) {
    expectPrms.success(
      createModulesDependencyModel(instanceFactory.getModulesModel()), function(modulesDependencyModel) {
        expect(modulesDependencyModel.internalDependencyNamesGraph).to.deep.equal({
          inner1: [],
          inner2: ['inner1']
        });
        expect(_.keys(modulesDependencyModel.internalDependencies)).to.deep.equal(['inner1', 'inner2']);
        expect(modulesDependencyModel.externalDependencies).to.deep.equal({
          'external-1': true
        });
      },
      cb
    );
  });

  it('Should fail on duplicate module name', function(cb) {
    expectPrms.fail(
      createModulesDependencyModel(instanceFactory.getDuplicatedModulesModel()), function(reason) {
        expect(reason + '').to.contain('Module duplication');
      },
      cb
    );
  });
});