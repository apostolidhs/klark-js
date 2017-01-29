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
  .catch(function(msg) {
    console.error(msg, _.get(msg, 'stack'));
    done(msg);
  });
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
  .catch(function(msg) {
    console.log(msg);
    done(msg);
  });
}

function invalidParameters(prms, done) {
  fail(prms, function(reason) {
    expect(reason + '').to.contain('Invalid parameters');
  }, done);
}

function checkArguments(prms, predicateFunc, done) {
  if (!(_.isObject(prms) && _.isFunction(predicateFunc) && _.isFunction(done))) {
    throw new Error('Invalid Arguments');
  }
}