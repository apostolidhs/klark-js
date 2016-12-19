
// module.exports = require('./lib/klark');
const path = require('path');

require('./lib/klark').run({
  predicateFilePicker: () => {
    const modules = `test/normal-plugins/**/index.js`;
    const subModules = `test/normal-plugins/**/*.module.js`;
    return [modules, subModules];
  },
  base: __dirname
});