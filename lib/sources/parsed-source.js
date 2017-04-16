const _ = require('lodash')
const debug = require('debug')('nukecss:parsed-source')
const SimpleSource = require('./simple-source')

class ParsedSource {
  constructor(text, parsed, options = {}) {
    this._text = text
    this._parsed = parsed
    this._options = options
    this._tokensArray = Array.from(parsed.tokens).map(t => t.toLowerCase())
    this._tokens = new Set(this._tokensArray)
  }

  get type() {
    throw new Error('unimplemented')
  }

  _findWholeSelectorInTokens(selector) {
    return this._tokensArray.find(token => ParsedSource.textContains(token, selector))
  }

  _findToken() {
    return false
  }

  contains(selector) {
    selector = selector.toLowerCase()
    return Boolean(this._tokens.has(selector) ||
      this._findWholeSelectorInTokens(selector) ||
      this._findToken(selector))
  }

  _joinParsed(parsedA, parsedB, tokens) {
    return Object.assign({}, parsedA, parsedB, {tokens})
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
    const parsed = this._joinParsed(this._parsed, that._parsed, tokens)
    return new Class(`${this._text}${joiner}${that._text}`, parsed, this._options)
  }

  static from(text, options) {
    try {
      const Class = this
      const parsed = Class.parse(text, options)
      return new Class(text, parsed, options)
    } catch (err) {
      debug(err)
      return new SimpleSource(text, options)
    }
  }

  static textContains(text, selector) {
    return SimpleSource.textContains(text, selector)
  }
}

module.exports = ParsedSource
