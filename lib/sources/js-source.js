const esprima = require('esprima')
const ParsedSource = require('./parsed-source')

class JsSource extends ParsedSource {
  get type() {
    return 'js'
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
    return Boolean(this._tokens.has(selector) ||
      this._findWholeSelectorInTokens(selector) ||
      this._findSelectorPartsInTokens(selector))
  }

  static get joiner() {
    return ';\n/* joined by nukecss */\n'
  }

  static parse(text) {
    const jsStrings = esprima.tokenize(text)
      .filter(token => token.type === 'String')
      .map(token => token.value.substr(1, token.value.length - 2).toLowerCase())
    return new Set(jsStrings)
  }
}

module.exports = JsSource
