class Source {
  constructor(text) {
    this._text = text
  }

  contains(selector) {
    return Source.textContains(this._text, selector)
  }

  static textContains(text, selector) {
    return new RegExp(`\\b${selector}\\b`, 'i').test(text)
  }
}

module.exports = Source
