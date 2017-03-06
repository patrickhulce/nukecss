const _ = require('lodash')
const debug = require('debug')('nukecss:parsed-source')
const SimpleSource = require('./simple-source')

class ParsedSource {
  constructor(text, tokens, opts = {}) {
    this._text = text
    this._options = opts
    this._tokens = tokens
    this._tokensArray = Array.from(tokens)
  }

  get type() {
    throw new Error('unimplemented')
  }

  contains() {
    throw new Error('unimplemented')
  }

  join(that) {
    const Class = this.constructor
    if (this.type !== that.type) {
      throw new Error(`${Class.name} can only be joined with ${Class.name}`)
    } else if (!_.isEqual(this._options, that._options)) {
      throw new Error('cannot join sources with different options')
    }

    const thisTokens = this._tokensArray || []
    const thatTokens = that._tokensArray || []
    const tokens = new Set(thisTokens.concat(thatTokens))
    const joiner = Class.joiner
    return new Class(`${this._text}${joiner}${that._text}`, tokens, this._options)
  }

  static from(text, opts) {
    try {
      const Class = this
      const tokens = Class.parse(text, opts)
      return new Class(text, tokens, opts)
    } catch (err) {
      debug(err)
      return new SimpleSource(text, opts)
    }
  }

  static textContains(text, selector) {
    return SimpleSource.textContains(text, selector)
  }
}

module.exports = ParsedSource
