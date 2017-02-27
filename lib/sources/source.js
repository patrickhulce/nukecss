class SimpleSource {
  constructor(text) {
    this._text = text
  }

  get type() {
    return 'simple'
  }

  contains(selector) {
    return SimpleSource.textContains(this._text, selector)
  }

  join(source) {
    if (source.type !== 'simple') {
      throw new Error('SimpleSource can only be joined with SimpleSource')
    }

    return new SimpleSource(`${this._text} ${source._text}`)
  }

  static textContains(text, selector) {
    return new RegExp(`\\b${selector}\\b`, 'i').test(text)
  }
}

module.exports = SimpleSource
