describe('fuse', function () {
  'use strict';

  var EventEmitter = require('events').EventEmitter
    , chai = require('chai')
    , fuse = require('../')
    , expect = chai.expect;

  it('exports it self as function', function() {
    expect(fuse).to.be.a('function');
  });

  it('returns the Base', function () {
    function Base() {} function Case() {}

    expect(fuse(Base, Case)).to.equal(Base);
  });

  it('does optional inherit', function () {
    function Base() {}

    expect(fuse(Base).prototype).to.equal(Base.prototype);
  });

  it('exposes the extend method', function () {
    function Base() {} function Case() {}
    fuse(Base, Case);

    expect(Base.extend).to.be.a('function');
  });

  it('exposes the mixin method', function () {
    function Base() {} function Case() {}
    fuse(Base, Case);

    expect(Base.prototype.mixin).to.be.a('function');
  });

  it('exposes the merge method', function () {
    function Base() {} function Case() {}
    fuse(Base, Case);

    expect(Base.prototype.merge).to.be.a('function');
  });

  it('adds writable and readable methods to the class', function () {
    function Base() {} function Case() {}
    fuse(Base, Case);

    expect(Base.writable).to.be.a('function');
    expect(Base.readable).to.be.a('function');

    expect(Base.prototype.foo).to.equal(undefined);
    expect(Base.prototype.bar).to.equal(undefined);

    Base.readable('foo', 'foo');
    Base.writable('bar', 'bar');

    expect(Base.prototype.foo).to.equal('foo');
    expect(Base.prototype.bar).to.equal('bar');
  });

  it('sets the constructor back to the Base', function () {
    function Base() {} function Case() {}
    fuse(Base, Case);

    expect(Base.prototype.constructor).to.equal(Base);
    expect(new Base()).to.be.instanceOf(Base);
    expect(new Base()).to.be.instanceOf(Case);
  });

  it('doesnt add the default methods if we dont want it', function () {
    function Base() {} function Case() {}
    fuse(Base, Case, { defaults: false });

    var base = new Base();

    expect(base).to.be.instanceOf(Base);
    expect(base).to.be.instanceOf(Case);

    expect(base.emits).to.equal(undefined);
    expect(base.mixin).to.equal(undefined);
  });

  it('allows disabling of individual methods', function () {
    function Base() {} function Case() {}
    fuse(Base, Case, { mixin: false });

    var base = new Base();

    expect(base).to.be.instanceOf(Base);
    expect(base).to.be.instanceOf(Case);

    expect(base.emits).to.be.a('function');
    expect(base.mixin).to.equal(undefined);
  });

  it('accepts options as second argument', function () {
    function Base() {}
    fuse(Base, { mixin: false });

    var base = new Base();

    expect(base.emits).to.be.a('function');
    expect(base.mixin).to.equal(undefined);
  });

  describe('emits', function () {
    it('adds the emits function to the prototype', function () {
      function Base() {} function Case() {}
      fuse(Base, Case);

      expect(Base.prototype.emits).to.be.a('function');
    });

    it('returns a function that emits the given event', function (done) {
      function Base() {}
      fuse(Base, EventEmitter);

      var base = new Base()
        , emits = base.emits('event');

      base.once('event', function (data) {
        expect(data).to.equal('foo');
        done();
      });

      emits('foo');
    });

    it('accepts a parser method that transforms the emitted values', function (done) {
      function Base() {}
      fuse(Base, EventEmitter);

      var base = new Base()
        , emits = base.emits('event', function (arg) {
            expect(arg).to.equal('bar');
            return 'foo';
          });

      base.once('event', function (data) {
        expect(data).to.equal('foo');
        done();
      });

      emits('bar');
    });

    it('curries arguments', function (done) {
      function Base() {}
      fuse(Base, EventEmitter);

      var base = new Base()
        , emits = base.emits('event', 'foo');

      base.once('event', function (data, foo) {
        expect(data).to.equal('foo');
        expect(foo).to.equal('bar');
        done();
      });

      emits('bar');
    });

    it('can prefix events', function (done) {
      function Base() {}
      fuse(Base, EventEmitter, {
        prefix: 'foo::'
      });

      var base = new Base()
        , emits = base.emits('event', 'foo');

      base.once('foo::event', function (data, foo) {
        expect(data).to.equal('foo');
        expect(foo).to.equal('bar');
        done();
      });

      emits('bar');
    });
  });
});
