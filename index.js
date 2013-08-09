var util = require('util');
var Readable = require('stream').Readable;

var defaultKey = function(val) {
	return val.key || val;
};

var stream2 = function(stream) {
	if (stream._readableState) return stream;
	return new Readable({objectMode:true}).wrap(stream);
};

var destroy = function(stream) {
	if (stream.readable && stream.destroy) stream.destroy();
};

var reader = function(self, stream, toKey) {
	stream = stream2(stream);

	var onmatch;
	var target;
	var ended = false;

	var consume = function() {
		var data;
		while (onmatch && (data = stream.read())) {
			var key = toKey(data);
			if (target !== undefined && key < target) return;
			var tmp = onmatch;
			onmatch = undefined;
			tmp(data, key);
		}
	};

	stream.on('error', function(err) {
		self.emit('error', err);
	});

	stream.on('end', function() {
		ended = true;
		if (onmatch) self.push(null);
	});

	stream.on('readable', consume);

	return function(key, fn) {
		if (ended) return self.push(null);
		onmatch = fn;
		target = key;
		consume();
	};
};

var Intersect = function(a, b, toKey) {
	if (!(this instanceof Intersect)) return new Intersect(a, b, toKey);
	Readable.call(this, {objectMode:true});

	toKey = typeof toKey === 'function' ? toKey : defaultKey;

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