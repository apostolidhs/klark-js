'use strict';

var _ = require('lodash');
var expect = require('chai').expect;

var logger = require('../../lib/logger');

describe('Logger', function() {

  it('Should properly log a message', function() {
    _.each(['log', 'info', 'warn', 'error'], function(rootType) {
      logger.setLoggerDecorator(function(type, msg) {
        expect(type).to.equal(rootType);
        expect(msg).to.deep.equal(['- klark: ', 'hi']);
      });
      logger[rootType]('hi');
    });
  });

  it('Should properly log a message if high log level is enable', function() {
    logger.setLoggerDecorator(function(type, msg) {
      expect(type).to.equal('log');
      expect(msg).to.deep.equal(['- klark: ', 'hi']);
    });
    logger.setLogLevel('high');
    logger.high('hi');
    logger.middle('hi');
    logger.setLogLevel('low');
    logger.low('hi');
  });

  it('Should properly not log a message if log level is off', function() {
    logger.setLoggerDecorator(function(type, msg) {
      expect(false).to.equal(true);
    });
    logger.setLogLevel('off');
    logger.high('hi');
    expect(true).to.equal(true);
    logger.setLoggerDecorator();
  });

  it('Should assert on error', function() {
    expect(function() {
      logger.assert(false, 'test');
    }).to.throw(/test/);
    expect(logger.assert(true, 'test')).to.equal(undefined);
  })

});