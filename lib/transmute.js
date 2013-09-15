/*!
 * Transmute
 * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var extend = require('tea-extend');
var inherits = require('util').inherits;
var Transform = require('stream').Transform;

/*!
 * Primary export
 */

module.exports = Transmute;

/**
 * Create a transform stream from a function
 * or a spec.
 *
 * - `tranform` {Function} transform function
 * - `flush` {Function} flush function
 * - `initialize` {Function} construction hook function
 * - `options` {Object} options for `Tranform` construction
 * - `readable` {Object} options to merge with `.readableState`
 * - `writable` {Object} options to merge with `.writableState`
 *
 * @param {Function|Object} transform function of setting object
 * @return {Transmute}
 * @api public
 */

function Transmute(spec) {
  if (!(this instanceof Transmute)) return new Transmute(spec);
  if ('function' === typeof spec) spec = { transform: spec };
  spec = spec || {};

  Transform.call(this, spec.options || {});
  extend(this._readableState, spec.readable || {});
  extend(this._writableState, spec.writable || {});

  this._transmuteState = {};
  this._transmuteState.transform = spec.transform;
  this._transmuteState.flush = spec.flush;

  if (spec.initialize && 'function' === typeof spec.initialize) {
    spec.initialize.call(this);
  }
}

/*!
 * Inherit from transform
 */

inherits(Transmute, Transform);

/*!
 * Implement transform hook
 *
 * @param {Mixed} chunk
 * @param {String} encoding
 * @param {Function} callback
 * @api private
 */

Transmute.prototype._transform = function(chunk, enc, cb) {
  var transform = this._transmuteState.transform;

  if (!transform || 'function' !== typeof transform) {
    return cb(null, chunk);
  }

  transform.call(this, chunk, enc, cb);
};

/*!
 * Implement flush hook
 *
 * @param {Function} callback
 * @api private
 */

Transmute.prototype._flush = function(cb) {
  var flush = this._transmuteState.flush;

  if (!flush || 'function' !== typeof flush) {
    return cb(null);
  }

  flush.call(this, cb);
};
