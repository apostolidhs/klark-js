'use strict';

KlarkModule(module, 'normalPluginsPlugin3', function(normalPluginsPlugin1, normalPluginsPlugin2) {
  return {
    log: 'plugin3',
    log1: normalPluginsPlugin1.log,
    log2: normalPluginsPlugin2.log
  };
});