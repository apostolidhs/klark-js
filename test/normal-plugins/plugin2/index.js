/* jshint esversion:6, node:true  */

'use strict';

klarkModule(module, 'normalPluginsPlugin2', ($globby, normalPluginsPlugin1) => {
  
  return {
    log: 'plugin2',
    log1: normalPluginsPlugin1.log
  };
});