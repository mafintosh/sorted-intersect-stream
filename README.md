# sorted-intersect-stream

Get the intersection of two sorted streams.

```
npm install sorted-intersect-stream
```

[![build status](https://secure.travis-ci.org/mafintosh/sorted-intersect-stream.png)](http://travis-ci.org/mafintosh/sorted-intersect-stream)

## Usage

It is easy to use

``` js
var intersect = require('sorted-intersect-stream')
var from = require('from2-array') // npm install event-stream

// from2-array converts an array into a stream
var sorted1 = from.obj([0,10,24,42,43,50,55])
var sorted2 = from.obj([10,42,53,55,60])

// combine the two streams into a single intersected stream
var intersection = intersect(sorted1, sorted2)

intersection.on('data', function(data) {
  console.log('intersected at '+data)
})
intersection.on('end', function() {
  console.log('no more intersections')
})
```

Running the above example will print

```
intersected at 10
intersected at 42
intersected at 55
no more intersections
```

When the intersection ends the two input streams will be destroyed. Set`intersection.autoDestroy = false` to disable this.

## Streaming objects

Per default the `.key` property is used to compare objects.

If you are streaming objects you should add a `toKey` function as the third parameter.
`toKey` should return an key representation of the data that can be used to compare objects.

_The keys MUST be sorted_

``` js
var sorted1 = from.obj([{foo:'a'}, {foo:'b'}, {foo:'c'}])
var sorted2 = from.obj([{foo:'b'}, {foo:'d'}])

var intersection = intersect(sorted1, sorted2, function(data) {
  return data.foo // data.key is sorted
});

intersection.on('data', function(data) {
  console.log(data) // will print {foo:'b'}
});
```

A good use-case for this kind of module is implementing something like full-text search where you want to
intersect multiple index hits.

## Intersecting LevelDB streams

Since [levelup](https://github.com/rvagg/node-levelup) streams are sorted in relation to their keys it is
easy to intersect them using sorted-intersect-stream.

If we wanted to intersect two namespaces `foo` and `bar` we could do it like so

``` js
var db = levelup('mydatabase', {valueEncoding:'json'})

var foo = db.createReadStream({
  start: 'foo:',
  end: 'foo;'
})

var bar = db.createReadStream({
  start: 'bar:',
  end: 'bar;'
})

var intersection = intersect(foo, bar, function(data) {
  // remove the namespace from the keys so they are comparable
  return data.key.split(':').slice(1).join(':')
})
```

## License

MIT
