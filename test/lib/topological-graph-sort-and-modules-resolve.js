'use strict';

var expect = require('chai').expect;
var path = require('path');
var expectPrms = require('../utilities/expect-promise');
var instanceFactory = require('../utilities/instance-factory');
var resolveModulesDependencyModel = require('../../lib/resolve-modules-dependency-model');

describe('Resolve modules dependency model', function() {
  it('Should reject on invalid parameters', function(cb) {
    expectPrms.invalidParameters(resolveModulesDependencyModel(), cb);
  });

  it('Should successfully resolve a basic graph', function(cb) {
    expectPrms.success(
      resolveModulesDependencyModel(instanceFactory.getModulesDependencyModel()), function(ModulesDependencyModel) {
        expect(ModulesDependencyModel.sortedInnerModules).to.deep.equal(['inner3', 'inner2', 'inner1']);
      },
      cb
    );
  });

  it('Should identify the cycle graph', function(cb) {
    var model = {
      internalDependencyNamesGraph: {
        a: ['b'],
        b: ['c', 'v', 'q'],
        q: ['a']
      },
      internalDependencies: ['a', 'b', 'q', 'c', 'v']
    };
    expectPrms.fail(
      resolveModulesDependencyModel(model), function(reason) {
        expect(reason + '').to.contain('Cycle dependencies');
      },
      cb
    );
  });

  it('Should successfully resolve a middle-level graph', function(cb) {
    var result = ['a', 'b', 'q', 'm', 'v', '1', '2', 'w', 'o', 'c', 'z'];
    var model = {
      internalDependencyNamesGraph: {
        a: ['b', 'q'],
        m: ['w', '1', '2', 'o', 'v'],
        b: ['c', 'v', 'q'],
        q: ['z', 'm'],
        v: ['1', '2']
      },
      internalDependencies: result
    };
    expectPrms.success(
      resolveModulesDependencyModel(model), function(ModulesDependencyModel) {
        expect(ModulesDependencyModel.sortedInnerModules).to.deep.equal(result);
      },
      cb
    );
  });
});