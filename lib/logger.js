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
  assert,
  setLoggerDecorator
};

var loggerDecorator;
var logLevel = 'off';

function setLoggerDecorator(_loggerDecorator) {
  loggerDecorator = _loggerDecorator;
}

function setLogLevel(_logLevel) {
  logLevel = _logLevel;
}

function low() {
  if (logLevel === 'low' || logLevel === 'middle' || logLevel === 'high') {
    apply('log', arguments);
  }
}

function middle() {
  if (logLevel === 'middle' || logLevel === 'high') {
    apply('log', arguments);
  }
}

function high() {
  if (logLevel === 'high') {
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
  var msg = ['- klark: '].concat([].slice.call(args));
  if (loggerDecorator) {
    loggerDecorator(type, msg);
  } else {
    console[type].apply(console, msg);
  }
}