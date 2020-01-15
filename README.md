# sorted-intersect-stream

Get the intersection of two sorted streams.

```
npm install sorted-intersect-stream
```

[![build status](https://secure.travis-ci.org/mafintosh/sorted-intersect-stream.png)](http://travis-ci.org/mafintosh/sorted-intersect-stream)

## Usage

It is easy to use

``` js
const Intersect = require('sorted-intersect-stream')
const { Readable } = require('streamx')

const sorted1 = Readable.from([0, 10, 24, 42, 43, 50, 55])
const sorted2 = Readable.from([10, 42, 53, 55, 60])

// combine the two streams into a single intersected stream
const intersection = new Intersect(sorted1, sorted2)

intersection.on('data', function(data) {
  console.log('intersected at ' + data)
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

If you are streaming objects sorting is based on the compare function you can pass as the 3rd argument.

``` js
const sorted1 = Readable.from([{ foo:'a' }, { foo:'b' }, { foo:'c' }])
const sorted2 = Readable.from([{ foo:'b' }, { foo:'d' }])

const i = new Intersect(sorted1, sorted2, function(a, b) {
  return a.foo < b.foo ? -1 : a.foo > b.foo ? 1 : 0
})

i.on('data', function(data) {
  console.log(data)
})
```

A good use-case for this kind of module is implementing something like full-text search where you want to
intersect multiple index hits.

## Intersecting LevelDB streams

Since [levelup](https://github.com/rvagg/node-levelup) streams are sorted in relation to their keys it is
easy to intersect them using sorted-intersect-stream.

If we wanted to intersect two namespaces `foo` and `bar` we could do it like so

``` js
const db = levelup('mydatabase', {valueEncoding:'json'})

const foo = db.createReadStream({
  start: 'foo:',
  end: 'foo;'
})

const bar = db.createReadStream({
  start: 'bar:',
  end: 'bar;'
})

const intersection = new Intersect(foo, bar, function (a, b) {
  const aKey = toKey(a)
  const bKey = toKey(b)
  return aKey < bKey ? -1 : aKey > bKey ? 1 : 0
})

function toKey (data) {
  // remove the namespace from the keys so they are comparable
  return data.key.split(':').slice(1).join(':')
}
```

## License

MIT
