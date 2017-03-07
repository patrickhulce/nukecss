const _ = require('lodash')
const debug = require('debug')('nukecss:parsed-source')
const SimpleSource = require('./simple-source')

class ParsedSource {
  constructor(text, tokens, opts = {}) {
    this._text = text
    this._options = opts
    this._tokensArray = Array.from(tokens).map(t => t.toLowerCase())
    this._tokens = new Set(this._tokensArray)
  }

  get type() {
    throw new Error('unimplemented')
  }

  _findWholeSelectorInTokens(selector) {
    return this._tokensArray.find(token => ParsedSource.textContains(token, selector))
  }

  _findSelectorPartsInTokens(selector) {
    if (selector.length === 0) {
      return true
    }

    for (let i = 1; i <= selector.length; i++) {
      const part = selector.substr(0, i)
      const rest = selector.substr(i)
      if (this._tokens.has(part) && this._findSelectorPartsInTokens(rest)) {
        return true
      }
    }

    return false
  }

  contains(selector) {
    selector = selector.toLowerCase()
    return Boolean(this._tokens.has(selector) ||
      this._findWholeSelectorInTokens(selector) ||
      this._findSelectorPartsInTokens(selector))
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
