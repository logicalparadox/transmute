# transmute [![Build Status](https://travis-ci.org/logicalparadox/transmute.png?branch=master)](https://travis-ci.org/logicalparadox/transmute)

> No-inheritance transform streams.

#### Installation

`transmute` is available on [npm](http://npmjs.org).

    npm install transmute

## Usage

Transmute makes it easier to build transform streams avoiding inheritance 
in simple scenarios where it is not needed.

```js
var fs = require('fs');
var transmute = require('transmute');

var in = fs.createReadStream('lowercase.txt');
var out = fs.createWriteStream('uppercase.txt');

var uppercase = transmute(function(chunk, enc, cb) {
  cb(null, chunk.toString().toUpperCase());
});

in.pipe(uppercase).pipe(out);
```

If options need to be provided (such as `objectMode`), transmute makes
it easy to customize the transform stream. The following example illustrates
`objectMode` when writing to the stream but the same also applies for `readable`.

```js
var fs = require('fs');
var transmute = require('transmute');

var out = fs.createWriteStream('log.txt');

var log = transmute({
    writable: { objectMode: true, highWaterMark: 1 }
  , transform: function(obj, enc, cb) {
      // avoid circular references
      try { var res = JSON.stringify(obj); }
      catch (ex) { return cb(ex); }
      cb(null, res + '\n');
    }
});

log.pipe(out);
log.write({ type: 'debug', msg: 'debug the universe' });
log.write({ type: 'info', msg: 'hello universe' });
``

If the same options apply for both sides of the transform then don't repeat yourself.

```js
var transmute = require('transmute');

var filter = transmute({
    options: { objectMode: true, highWaterMark: 1 }
  , transform: function(obj, enc, cb) {
      if (obj.type === 'debug') return cb();
      cb(null, obj);
    }
});

log.pipe(filter).pipe(out);
log.write({ type: 'debug', msg: 'debug the universe' });
log.write({ type: 'info', msg: 'hello universe' });
```

If you want to provide a `flush` function to be invoked when the stream
ends, that is easy too.

```js
var fs = require('fs');
var transmute = require('transmute');

var out = fs.createWriteStream('log.txt');

var log = transmute({
    writable: { objectMode: true, highWaterMark: 1 }
  , transform: function(obj, enc, cb) {
      var type = obj.type;
      var msg = obj.msg;
      cb(null, '[' + type + '] ' + msg + '\n');
    }
  , flush: function(cb) {
      var ended = new Date().toUTCString()
      cb(null, '[info] Log ended at ' + ended + '.\n');
    }
});

log.pipe(out);
log.write({ type: 'debug', msg: 'debug the universe' });
log.write({ type: 'info', msg: 'hello universe' });
log.end();
```
#### License

(The MIT License)

Copyright (c) 2012 Jake Luer <jake@alogicalparadox.com> (http://alogicalparadox.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
