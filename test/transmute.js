function read(fn) {
  return function() {
    var data = this.read();
    if (data) fn(data);
  }
}

describe('transmute', function() {
  describe('when invoked without options', function() {
    it('behaves like a through stream', function(done) {
      var stream = transmute();

      var readable = chai.spy('readable', function(data) {
        data.toString().should.equal('hello universe');
      });

      stream.on('readable', read(readable));

      stream.on('end', function() {
        readable.should.have.been.called(1);
        done();
      });

      stream.write('hello universe');
      stream.end();
    });
  });

  describe('when transform fn provided', function() {
    it('transforms readable:string to writable:string', function(done) {
      var uppercase = chai.spy('uppercase', function(chunk, enc, cb) {
        cb(null, chunk.toString().toUpperCase());
      });

      var stream = transmute(uppercase);

      var readable = chai.spy('readable', function(data) {
        data.toString().should.equal('HELLO UNIVERSE');
      });

      stream.on('readable', read(readable));

      stream.on('end', function() {
        uppercase.should.have.been.called(1);
        readable.should.have.been.called(1);
        done();
      });

      stream.write('hello universe');
      stream.end();
    });

    it('transforms readable:object to writable:string', function(done) {
      var tostring = chai.spy('tostring', function(obj, enc, cb) {
        cb(null, JSON.stringify(obj));
      });

      var stream = transmute({
        writable: { objectMode: true, highWaterMark: 1 },
        transform: tostring
      });

      stream._writableState.should.have.property('objectMode', true);
      stream._writableState.should.have.property('highWaterMark', 1);

      var readable = chai.spy('readable', function(data) {
        data.toString().should.equal(JSON.stringify({ hello: 'universe' }));
      });

      stream.on('readable', read(readable));

      stream.on('end', function() {
        tostring.should.have.been.called(1);
        readable.should.have.been.called(1);
        done();
      });

      stream.write({ hello: 'universe' });
      stream.end();
    });

    it('transforms readable:string to writable:object', function(done) {
      var tojson = chai.spy('tojson', function(str, enc, cb) {
        cb(null, JSON.parse(str));
      });

      var stream = transmute({
        readable: { objectMode: true, highWaterMark: 1 },
        transform: tojson
      });

      var readable = chai.spy('readable', function(data) {
        data.should.deep.equal({ hello: 'universe' });
      });

      stream.on('readable', read(readable));

      stream.on('end', function() {
        tojson.should.have.been.called(1);
        readable.should.have.been.called(1);
        done();
      });

      stream.write(JSON.stringify({ hello: 'universe' }));
      stream.end();
    });

    it('transforms readable:object to writable:object', function(done) {
      var addprop = chai.spy('addprop', function(obj, enc, cb) {
        obj.universe = 'hello';
        cb(null, obj);
      });

      var stream = transmute({
        options: { objectMode: true, highWaterMark: 1 },
        transform: addprop
      });

      var readable = chai.spy('readable', function(data) {
        data.should.deep.equal({ hello: 'universe', universe: 'hello'  });
      });

      stream.on('readable', read(readable));
      stream.on('end', function() {
        addprop.should.have.been.called(1);
        readable.should.have.been.called(1);
        done();
      });

      stream.write({ hello: 'universe' });
      stream.end();
    });
  });

  describe('when flush fn is provided', function() {
    it('flushes upon end', function(done) {
      var flush = chai.spy('flush', function(cb) {
        this.push(' again');
        cb();
      });

      var stream = transmute({ flush: flush });
      var res = '';

      var readable = chai.spy('readable', function(data) {
        res += data.toString();
      });

      stream.on('readable', read(readable));

      stream.on('end', function() {
        flush.should.have.been.called(1);
        readable.should.have.been.called(2);
        res.should.equal('hello universe again');
        done();
      });

      stream.write('hello universe');
      stream.end();
    });
  });

  describe('when initialize fn is provide', function() {
    it('is invoked during construction', function() {
      var init = chai.spy('init');
      var stream = transmute({ initialize: init });
      init.should.have.been.called(1);
    });
  });
});
