var transmute = require('..');

var log = transmute({
    options: { objectMode: true, highWaterMark: 1 }
  , transform: function(obj, enc, cb) {
      obj.timestamp = new Date();
      cb(null, obj);
    }
  , flush: function(cb) {
      var ended = {};
      ended.timestamp = new Date();
      ended.type = 'info';
      ended.msg = 'Log ended';
      this.push(ended);
      cb();
    }
});

var nodebug = transmute({
    options: { objectMode: true, highWaterMark: 1 }
  , transform: function(obj, enc, cb) {
      if (obj.type === 'debug') return cb();
      cb(null, obj);
    }
});

var display = transmute({
    writable: { objectMode: true, highWaterMark: 1 }
  , transform: function(obj, enc, cb) {
      cb(null, '  ' + obj.timestamp.toUTCString() + ' [' + obj.type + '] ' + obj.msg + '\n');
    }
});

log.pipe(nodebug).pipe(display).pipe(process.stdout);
log.write({ type: 'info', msg: 'hello universe' });
log.write({ type: 'debug', msg: 'debug the universe' });
log.write({ type: 'info', msg: 'did you see the debug, thought not.' });
log.end();
