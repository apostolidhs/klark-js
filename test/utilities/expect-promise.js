'use strict';

var expect = require('chai').expect;
var _ = require('lodash');

module.exports = {
  success: success,
  fail: fail,
  invalidParameters: invalidParameters
};

function success(prms, predicateFunc, done) {
  checkArguments.apply(undefined, arguments);
  prms.then(function() {
    predicateFunc.apply(undefined, arguments);  
    done();
  })
  .catch(done);
}

function fail(prms, predicateFunc, done) {
  checkArguments.apply(undefined, arguments);
  prms.then(function() {
    done('Should throw an error');
  })
  .catch(function(reason) {
    predicateFunc.apply(undefined, arguments);  
    done();      
  })
  .catch(done);
}

function invalidParameters(prms, done) {
  fail(prms, function(reason) {
    expect(reason + '').to.contain('Invalid parameters'); 
  }, done);
}

function checkArguments(prms, predicateFunc, done) {
  if (!(_.isObject(prms) && _.isFunction(done) && _.isFunction(predicateFunc))) {
    throw new Error('Invalid Arguments');
  }
}