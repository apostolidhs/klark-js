'use strict';

KlarkModule(module, 'normalPluginsPlugin2', function($globby, normalPluginsPlugin1) {

  return {
    log: 'plugin2',
    log1: normalPluginsPlugin1.log
  };
});