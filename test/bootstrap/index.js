/*!
 * Attach chai to global should
 */

global.chai = require('chai');
global.should = global.chai.should();

/*!
 * Chai Plugins
 */

global.chai.use(require('chai-spies'));
//global.chai.use(require('chai-http'));

/*!
 * Import project
 */

global.transmute = require('../..');

/*!
 * Helper to load internals for cov unit tests
 */

function req (name) {
  return process.env.transmute_COV
    ? require('../../lib-cov/transmute/' + name)
    : require('../../lib/transmute/' + name);
}

/*!
 * Load unexposed modules for unit tests
 */

global.__transmute = {};
