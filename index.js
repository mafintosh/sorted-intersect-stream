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

	var onend = function() {
		ended = true;
	};

	stream.on('close', onend);
	stream.on('end', onend);
	stream.on('data', function(data) {
		var key = toKey(data);
		if (target !== undefined && key < target) return;
		stream.pause();
		onmatch(data, key);
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

	this.on('end', function() {
		destroy(a);
		destroy(b);
	});
};

util.inherits(Intersect, Readable);

Intersect.prototype._read = function() {
	this._loop(undefined);
};

Intersect.prototype._loop = function(last) {
	var self = this;
	self._readA(last, function(match, matchKey) {
		if (matchKey === last) return self.push(match);
		self._readB(matchKey, function(other, otherKey) {
			if (otherKey === matchKey) return self.push(other);
			self._loop(otherKey);
		});
	});
};

module.exports = Intersect;