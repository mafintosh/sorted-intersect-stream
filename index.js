const { Readable } = require('streamx')

module.exports = class SortedIntersectStream extends Readable {
  constructor (left, right, compare) {
    super()

    if (!left.destroy || !right.destroy) throw new Error('Only modern stream supported')

    this.left = new Peaker(left)
    this.right = new Peaker(right)
    this.compare = compare || defaultCompare
    this._missing = 2
    this._onclose = null
    this._track(left)
    this._track(right)
  }

  _read (cb) {
    const self = this

    let left = null
    let right = null
    let missing = 2

    this.left.read(function (err, l) {
      if (err) return cb(err)
      if (!l) return self._readBoth(null, null, cb)
      left = l
      if (!--missing) self._readBoth(left, right, cb)
    })

    this.right.read(function (err, r) {
      if (err) return cb(err)
      if (!r) return self._readBoth(null, null, cb)
      right = r
      if (!--missing) self._readBoth(left, right, cb)
    })
  }

  _readBoth (l, r, cb) {
    if (l === null || r === null) {
      this.push(null)
      return cb(null)
    }

    const cmp = this.compare(l, r)

    if (cmp === 0) {
      this.push(l)
      this.left.consume()
      this.right.consume()
      return cb(null)
    }

    if (cmp < 0) {
      this.left.consume()
    } else {
      this.right.consume()
    }

    this._read(cb)
  }

  _predestroy () {
    this.left.stream.destroy()
    this.right.stream.destroy()
  }

  _destroy (cb) {
    if (!this.missing) return cb(null)
    this._onclose = cb
  }

  _track (stream) {
    const self = this
    let closed = false

    stream.on('error', onclose)
    stream.on('close', onclose)

    function onclose (err) {
      if (err && typeof err === 'object') self.destroy(err)
      if (closed) return
      closed = true
      if (!--self._missing && self._onclose) self._onclose()
    }
  }
}

class Peaker {
  constructor (stream) {
    this.stream = stream
    this.stream.on('readable', this._onreadable.bind(this))
    this.stream.on('end', this._onend.bind(this))
    this.value = null
    this._reading = null
    this._ended = false
  }

  read (cb) {
    if (this.value) return cb(null, this.value)
    this._reading = cb
    this._onreadable()
  }

  consume () {
    this.value = null
  }

  _onend () {
    this._ended = true
    this._onreadable()
  }

  _onreadable () {
    if (this.value) return
    this.value = this.stream.read()
    if ((this.value !== null || this._ended) && this._reading) {
      const cb = this._reading
      this._reading = null
      cb(null, this.value)
    }
  }
}

function defaultCompare (a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}
