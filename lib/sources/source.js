class Source {
  constructor(text) {
    this._text = text
  }

  get type() {
    return 'simple'
  }

  contains(selector) {
    return Source.textContains(this._text, selector)
  }

  join(source) {
    if (source.type !== 'simple') {
      throw new Error('Source can only be joined with Source')
    }

    return new Source(`${this._text} ${source._text}`)
  }

  static textContains(text, selector) {
    return new RegExp(`\\b${selector}\\b`, 'i').test(text)
  }
}

module.exports = Source
