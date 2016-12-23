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

var logLevel = 'off';

function setLogLevel(_logLevel) {
  logLevel = _logLevel;
}

function low() {
  if (logLevel === 'low') {
    apply('log', arguments);
  }
}

function middle() {
  if (logLevel === 'middle' || logLevel === 'low') {
    apply('log', arguments);
  }
}

function high() {
  if (logLevel === 'high'|| logLevel === 'middle' || logLevel === 'low') {
    apply('log', arguments);
  }
}

function log() {
  apply('log', arguments);
}

function info() {
  apply('info', arguments);
}

function warn() {
  apply('warn', arguments);
}

function error() {
  apply('error', arguments);
}

function assert(cond, msg) {
  if (!cond) {
    throw new Error(msg);
  }
}

function apply (type, args) {
  console[type].apply(console, ['- klark: '].concat(args));
}