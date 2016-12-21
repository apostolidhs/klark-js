'use strict';

var expect = require('chai').expect;
var path = require('path');
var expectPrms = require('../utilities/expect-promise');
var instanceFactory = require('../utilities/instance-factory');
var configurationLoader = require('../../lib/configuration-loader');
var gatherModulesModel = require('../../lib/gather-modules-model');

describe('Gather modules model', function() {
  it('Should reject on invalid parameters', function(cb) {    
    expectPrms.invalidParameters(gatherModulesModel(), cb);      
  });

  it('Should reject on invalid file paths', function(cb) {    
    expectPrms.fail(
      gatherModulesModel('', ['fake1', 'fake2']), function(reason) {
        expect(reason + '').to.contain('does not exists'); 
      },
      cb
    );
  }); 

  it('Should match the corresponding file patterns', function(cb) {    
    var config = configurationLoader();
    expectPrms.success(
      gatherModulesModel(config.base, instanceFactory.getNormalPluginPaths()), function(ModulesModel) {
        expect(ModulesModel.length).to.equal(3); 
      },
      cb
    );
  });   

  it('Should reject on invalid module registration module', function(cb) { 
    var config = configurationLoader();
    expectPrms.fail(
      gatherModulesModel(config.base, ['test/samples/invalid-plugins/wrong-arguments-number.js']), function(reason) {
        expect(reason + '').to.contain('Invalid arguments'); 
      },
      cb
    );
  });

  it('Should reject on invalid module registration module name', function(cb) { 
    var config = configurationLoader();
    expectPrms.fail(
      gatherModulesModel(config.base, ['test/samples/invalid-plugins/wrong-module-name.js']), function(reason) {
        expect(reason + '').to.contain('Invalid arguments'); 
      },
      cb
    );
  });  

  it('Should match the corresponding file patterns', function(cb) {    
    var config = configurationLoader();
    expectPrms.success(
      gatherModulesModel(config.base, ['test/samples/normal-plugin-with-multi-dependencies.js']), function(modulesModel) {
        expect(modulesModel.length).to.equal(1); 
        var moduleModel = modulesModel[0];
        expect(moduleModel.name).to.equal('normalPluginWithMultiDependencies');
        expect(moduleModel.dependencies.length).to.equal(4);
        expect(moduleModel.dependencies[0].isExternal).to.equal(true);
        expect(moduleModel.dependencies[0].name).to.equal('external-1');
        expect(moduleModel.dependencies[1].isExternal).to.equal(false);
        expect(moduleModel.dependencies[1].name).to.equal('inner1');        
      },
      cb
    );
  });    
});