'use strict';

var expect = require('chai').expect;
var path = require('path');
var expectPrms = require('../utilities/expect-promise');
var trackApplicationFiles = require('../../lib/track-application-files');

describe('Track application files', function() {
  it('Should reject on invalid parameters', function(cb) {    
    expectPrms.invalidParameters(trackApplicationFiles(), cb);      
  });

  it('Should reject on not matching file patterns', function(cb) {    
    expectPrms.fail(
      trackApplicationFiles('', ['fake1', 'fake2']), function(reason) {
        expect(reason + '').to.contain('No source files'); 
      },
      cb
    );
  });  

  it('Should match the corresponding file patterns', function(cb) {    
    expectPrms.success(
      trackApplicationFiles(process.cwd(), ['test/samples/normal-plugins/**/index.js']), function(files) {
        expect(files.length).to.equal(3); 
      },
      cb
    );
  });  
});