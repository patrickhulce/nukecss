class Source {
  constructor(text) {
    this._text = text
  }

  contains(selector) {
    return new RegExp(`\\b${selector}\\b`, 'i').test(this._text)
  }
}

module.exports = Source
