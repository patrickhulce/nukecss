const esprima = require('esprima')
const debug = require('debug')('nukecss:js-source')
const SimpleSource = require('./simple-source')

class JsSource {
  constructor(text, opts = {}) {
    this._text = text

    let tokens = opts.tokens
    if (!tokens) {
      try {
        const jsStrings = esprima.tokenize(text)
          .filter(token => token.type === 'String')
          .map(token => token.value.substr(1, token.value.length - 2))
        tokens = new Set(jsStrings)
      } catch (err) {
        debug(err)
        return
      }
    }

    this._tokens = tokens
    this._tokensArray = Array.from(tokens)
  }

  get type() {
    return 'js'
  }

  _findWholeSelectorInTokens(selector) {
    return this._tokensArray.find(token => SimpleSource.textContains(token, selector))
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
    if (this._tokens) {
      return Boolean(this._tokens.has(selector) ||
        this._findWholeSelectorInTokens(selector) ||
        this._findSelectorPartsInTokens(selector))
    } else {
      return SimpleSource.textContains(this._text, selector)
    }
  }

  join(that) {
    if (that.type !== 'js') {
      throw new Error('JsSource can only be joined with JsSource')
    }

    const thisTokens = this._tokensArray || []
    const thatTokens = that._tokensArray || []
    const tokens = new Set(thisTokens.concat(thatTokens))
    const joiner = ';\n/* joined by nukecss */\n'
    return new JsSource(`${this._text}${joiner}${that._text}`, {tokens})
  }
}

module.exports = JsSource
