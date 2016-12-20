/* jshint esversion:6, node:true  */

'use strict';

module.exports = {
  low,
  middle,
  high,
  setLogLevel,
  log,
  info,
  warn,
  error,
  assert
};

let logLevel = 'high';

function setLogLevel(_logLevel) {
  logLevel = _logLevel;
}

function low() {
  if (logLevel === 'low') {
    console.log.apply(console, arguments);
  }
}

function middle() {
  if (logLevel === 'middle' || logLevel === 'low') {
    console.log.apply(console, arguments);
  }
}

function high() {
  if (logLevel === 'high'|| logLevel === 'middle' || logLevel === 'low') {
    console.log.apply(console, arguments);
  }
}

function log() {
  console.log.apply(console, arguments);
}

function info() {
  console.info.apply(console, arguments);
}

function warn() {
  console.warn.apply(console, arguments);
}

function error() {
  console.error.apply(console, arguments);
}

function assert(cond, msg) {
  if (!cond) {
    throw new Error(msg);
  }
}