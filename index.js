var Readable = require('stream').Readable;
var util = require('util');

var echo = function(val) {
	return val;
};

var destroy = function(stream) {
	if (stream.readable && stream.destroy) stream.destroy();
};

var reader = function(self, stream, toKey) {
	var target;
	var onmatch;
	var ended = false;

	stream.pause();

	stream.on('error', function(err) {
		self.emit('error', err);
	});

	stream.on('end', function() {
		ended = true;
	});

	stream.on('data', function(data) {
		if (!onmatch) return self.emit('error', new Error('source stream does not respect pause'));
		var key = toKey(data);
		if (ended) console.error('WATA')
		if (target !== undefined && key < target) return;
		stream.pause();
		var tmp = onmatch;
		onmatch = undefined;
		tmp(data, key);
	});

	return function(key, fn) {
		if (ended) return self.push(null);
		onmatch = fn;
		target = key;
		stream.resume();
	};
};

var Intersect = function(a, b, toKey) {
	if (!(this instanceof Intersect)) return new Intersect(a, b, toKey);
	Readable.call(this, {objectMode:true});

	toKey = toKey || echo;

	this._readA = reader(this, a, toKey);
	this._readB = reader(this, b, toKey);
	this._destroyed = false;

	this.on('end', function() {
		if (!this.autoDestroy) return;
		destroy(a);
		destroy(b);
	});
};

util.inherits(Intersect, Readable);

Intersect.prototype.autoDestroy = true;

Intersect.prototype.destroy = function() {
	this._destroyed = true;
	this.push(null);
};

Intersect.prototype._read = function() {
	this._loop(undefined);
};

Intersect.prototype._loop = function(last) {
	var self = this;
	self._readA(last, function(match, matchKey) {
		if (matchKey === last && !self._destroyed) return self.push(match);
		self._readB(matchKey, function(other, otherKey) {
			if (otherKey === matchKey && !self._destroyed) return self.push(other);
			self._loop(otherKey);
		});
	});
};

module.exports = Intersect;