/* jshint esversion:6, node:true  */

'use strict';

klarkModule(module, 'normalPluginsPlugin3', (normalPluginsPlugin1, normalPluginsPlugin2) => {
  return {
    log: 'plugin3',
    log1: normalPluginsPlugin1.log,
    log2: normalPluginsPlugin2.log
  };
});