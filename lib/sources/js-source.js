const esprima = require('esprima')
const debug = require('debug')('nukecss:js-source')
const Source = require('./source')

class JsSource extends Source {
  constructor(text) {
    super(text)

    try {
      const tokens = esprima.tokenize(text)
        .filter(token => token.type === 'String')
        .map(token => token.value.substr(1, token.value.length - 2))
      this._tokensArray = tokens
      this._tokens = new Set(tokens)
    } catch (err) {
      debug(err)
    }
  }

  _findWholeSelectorInTokens(selector) {
    return this._tokensArray.find(token => Source.textContains(token, selector))
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
      return Source.textContains(this._text, selector)
    }
  }
}

module.exports = JsSource
