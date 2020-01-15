const tape = require('tape')
const { Readable } = require('streamx')
const intersect = require('./')

tape('numbers', function (t) {
  const a = Readable.from([4, 4, 6, 10, 14, 15, 20, 22])
  const b = Readable.from([4, 6, 11, 20])

  const intersection = new intersect(a, b)
  const expected = [4, 6, 20]

  intersection.on('data', function (data) {
    t.same(data, expected.shift())
  })

  intersection.on('end', function () {
    t.same(expected.length, 0)
    t.end()
  })
})

tape('strings', function (t) {
  const a = Readable.from(['04', '04', '06', '10', '14', '15', '20', '22'])
  const b = Readable.from(['04', '06', '11', '20'])

  const intersection = new intersect(a, b)
  const expected = ['04', '06', '20']

  intersection.on('data', function (data) {
    t.same(data, expected.shift())
  })

  intersection.on('end', function () {
    t.same(expected.length, 0)
    t.end()
  })
})

tape('objects', function (t) {
  const a = Readable.from([{ key: '04' }, { key: '04' }, { key: '06' }, { key: '10' }, { key: '14' }, { key: '15' }, { key: '20' }, { key: '22' }])
  const b = Readable.from([{ key: '04' }, { key: '06' }, { key: '11' }, { key: '20' }])

  const intersection = new intersect(a, b, (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0)
  const expected = [{ key: '04' }, { key: '06' }, { key: '20' }]

  intersection.on('data', function (data) {
    t.same(data, expected.shift())
  })

  intersection.on('end', function () {
    t.same(expected.length, 0)
    t.end()
  })
})

tape('custom objects', function (t) {
  const a = Readable.from([{ foo: '04' }, { foo: '04' }, { foo: '06' }, { foo: '10' }, { foo: '14' }, { foo: '15' }, { foo: '20' }, { foo: '22' }])
  const b = Readable.from([{ foo: '04' }, { foo: '06' }, { foo: '11' }, { foo: '20' }])

  const intersection = new intersect(a, b, (a, b) => a.foo < b.foo ? -1 : a.foo > b.foo ? 1 : 0)
  const expected = [{ foo: '04' }, { foo: '06' }, { foo: '20' }]

  intersection.on('data', function (data) {
    t.same(data, expected.shift())
  })

  intersection.on('end', function () {
    t.same(expected.length, 0)
    t.end()
  })
})

tape('primary stream ends early without pending match', function (t) {
  const a = new Readable()
  const b = new Readable()

  const intersection = new intersect(a, b)
  const acc = []

  intersection.on('end', function () {
    t.deepEqual(acc, [1])
    t.end()
  })

  intersection.on('data', acc.push.bind(acc))

  a.push(1)
  b.push(1)
  a.push(null)

  setImmediate(function () {
    b.push(null)
  })
})

tape('primary stream ends early with pending match', function (t) {
  const a = new Readable()
  const b = new Readable()

  const intersection = new intersect(a, b)
  const acc = []

  intersection.on('end', function () {
    t.deepEqual(acc, [1])
    t.end()
  })

  intersection.on('data', acc.push.bind(acc))

  a.push(1)
  a.push(null)

  setImmediate(function () {
    b.push(1)
    b.push(null)
  })
})

tape('one infinite stream and one finite', function (t) {
  const a = new Readable()
  const b = new Readable()

  const intersection = new intersect(a, b)
  const acc = []

  intersection.on('end', function () {
    t.deepEqual(acc, [1])
    t.end()
  })

  intersection.on('data', acc.push.bind(acc))

  a.push(1)
  a.push(null)

  setImmediate(function () {
    b.push(1)
  })
})
