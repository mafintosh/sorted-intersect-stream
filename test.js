var tape = require('tape')
var Readable = require('readable-stream').Readable
var intersect = require('./index')

tape('numbers', function (t) {
  var a = new Readable({objectMode: true})
  var b = new Readable({objectMode: true})
  a._read = b._read = function () {}

  a.push(4)
  a.push(4)
  a.push(6)
  a.push(10)
  a.push(14)
  a.push(15)
  a.push(20)
  a.push(22)
  a.push(null)

  b.push(4)
  b.push(4)
  b.push(6)
  b.push(11)
  b.push(20)
  b.push(null)

  var intersection = intersect(a, b)
  var expected = [4, 6, 20]

  intersection.on('data', function (data) {
    t.same(data, expected.shift())
  })

  intersection.on('end', function () {
    t.same(expected.length, 0)
    t.end()
  })
})

tape('numbers', function (t) {
  var a = new Readable({objectMode: true})
  var b = new Readable({objectMode: true})
  a._read = b._read = function () {}

  a.push('04')
  a.push('04')
  a.push('06')
  a.push('10')
  a.push('14')
  a.push('15')
  a.push('20')
  a.push('22')
  a.push(null)

  b.push('04')
  b.push('04')
  b.push('06')
  b.push('11')
  b.push('20')
  b.push(null)

  var intersection = intersect(a, b)
  var expected = ['04', '06', '20']

  intersection.on('data', function (data) {
    t.same(data, expected.shift())
  })

  intersection.on('end', function () {
    t.same(expected.length, 0)
    t.end()
  })
})

tape('objects', function (t) {
  var a = new Readable({objectMode: true})
  var b = new Readable({objectMode: true})
  a._read = b._read = function () {}

  a.push({foo: '04'})
  a.push({foo: '04'})
  a.push({foo: '06'})
  a.push({foo: '10'})
  a.push({foo: '14'})
  a.push({foo: '15'})
  a.push({foo: '20'})
  a.push({foo: '22'})
  a.push(null)

  b.push({foo: '04'})
  b.push({foo: '04'})
  b.push({foo: '06'})
  b.push({foo: '11'})
  b.push({foo: '20'})
  b.push(null)

  var intersection = intersect(a, b, function (data) {
    return data.foo
  })
  var expected = [{foo: '04'}, {foo: '06'}, {foo: '20'}]

  intersection.on('data', function (data) {
    t.same(data, expected.shift())
  })

  intersection.on('end', function () {
    t.same(expected.length, 0)
    t.end()
  })
})

tape('custom objects', function (t) {
  var a = new Readable({objectMode: true})
  var b = new Readable({objectMode: true})
  a._read = b._read = function () {}

  a.push({key: '04'})
  a.push({key: '04'})
  a.push({key: '06'})
  a.push({key: '10'})
  a.push({key: '14'})
  a.push({key: '15'})
  a.push({key: '20'})
  a.push({key: '22'})
  a.push(null)

  b.push({key: '04'})
  b.push({key: '04'})
  b.push({key: '06'})
  b.push({key: '11'})
  b.push({key: '20'})
  b.push(null)

  var intersection = intersect(a, b)
  var expected = [{key: '04'}, {key: '06'}, {key: '20'}]

  intersection.on('data', function (data) {
    t.same(data, expected.shift())
  })

  intersection.on('end', function () {
    t.same(expected.length, 0)
    t.end()
  })
})
