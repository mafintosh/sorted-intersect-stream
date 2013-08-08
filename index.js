var Readable = require('stream').Readable;

var echo = function(val) {
	return val;
};

var reader = function(result, stream, toKey) {
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
		if (ended) return result.push(null);
		onmatch = fn;
		target = key;
		stream.resume();
	};
};

module.exports = function(streams, toKey) {
	if (streams.length === 1) return streams[0];

	toKey = toKey || echo;
	var result = new Readable({objectMode:true});

	if (streams.length === 0) {
		result.push(null);
		return result;
	}

	var readers = [];
	var matches = 0;
	var offset = 0;
	var matchKey = undefined;
	var looping = false;

	var oncandiate = function(cand, candKey) {
		looping = false;

		if (matchKey !== candKey) {
			matches = 0;
			matchKey = candKey;
		}

		offset = offset < streams.length-1 ? offset+1 : 0;
		if (++matches !== streams.length) return loop();
		if (result.push(cand)) return;

		loop();
	};

	var loop = function() {
		if (looping) return;
		looping = true;
		if (offset === readers.length) readers.push(reader(result, streams[offset], toKey));
		readers[offset](matchKey, oncandiate);
	};

	result._read = loop;
	return result;
};