var sandbox = require('nodeunit').utils.sandbox;

/**
 * @type {Kid3Builder}
 */
let builder = sandbox('./bin/Kid3Builder.js', {
    module: { exports: exports },
    require: require,
    console: console
}).module.exports;

module.exports = builder;
