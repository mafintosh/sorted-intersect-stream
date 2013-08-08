# sorted-intersect-stream

Intersect streams that emit sorted data

	npm install sorted-intersect-stream

This module is similar to [sorted-intersect](https://github.com/mafintosh/sorted-intersect)
except this intersects streams that emit sorted data instead of arrays of sorted data

## Usage

It is easy to use

``` js
var intersect = require('sorted-intersect-stream');
var es = require('event-stream'); // npm install event-stream

// es.readArray converts an array into a stream
var sorted1 = es.readArray([0,10,24,42,43,50,55]);
var sorted2 = es.readArray([10,42,53,55,60]);

// pass the streams you want to intersect in an array
var intersection = intersect([sorted1, sorted2]);

intersection.on('data', function(data) {
	console.log('intersected at '+data);
});
intersection.on('end', function() {
	console.log('no more intersections');
});
```

Running the above example will print

```
intersected at 10
intersected at 42
intersected at 55
no more intersections
```

If you are streaming objects instead of integers or strings you should add a `toKey` function as
the second parameter that returns a key that is sortable

``` js
var sorted1 = es.readArray([{key:'a'}, {key:'b'}, {key:'c'}]);
var sorted2 = es.readArray([{key:'b'}]);

var intersection = intersect([sorted1, sorted2], function(data) {
	return data.key;
});

intersection.on('data', function(data) {
	console.log(data); // will print {key:'b'}
});
```

A good use-case for this kind of module is implementing something like full-text search where you want to
intersect multiple index hits.

## License

MIT