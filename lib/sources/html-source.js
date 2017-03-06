const _ = require('lodash')
const HtmlParser = require('htmlparser2').Parser

const debug = require('debug')('nukecss:html-source')
const SimpleSource = require('./simple-source')

class HtmlSource {
  constructor(text, opts = {}) {
    this._text = text

    let tokens = opts.tokens
    if (!tokens) {
      try {
        tokens = HtmlSource.tokenizeHtml(text, opts)
      } catch (err) {
        debug(err)
        return
      }
    }

    this._tokens = tokens
    this._tokensArray = Array.from(tokens)
  }

  get type() {
    return 'html'
  }

  _findWholeSelectorInTokens(selector) {
    return this._tokensArray.find(token => SimpleSource.textContains(token, selector))
  }

  contains(selector) {
    if (this._tokens) {
      return Boolean(this._tokens.has(selector) ||
        this._findWholeSelectorInTokens(selector))
    } else {
      return SimpleSource.textContains(this._text, selector)
    }
  }

  join(that) {
    if (that.type !== 'html') {
      throw new Error('HtmlSource can only be joined with HtmlSource')
    }

    const thisTokens = this._tokensArray || []
    const thatTokens = that._tokensArray || []
    const tokens = new Set(thisTokens.concat(thatTokens))
    const joiner = '\n<!-- joined by nukecss -->\n'
    return new HtmlSource(`${this._text}${joiner}${that._text}`, {tokens})
  }

  static tokenizeHtml(text) {
    const tokens = new Set()

    const parser = new HtmlParser({
      onopentag(name, attributes) {
        [name, attributes.id, attributes.class]
          .filter(candidate => typeof candidate === 'string')
          .forEach(candidate => tokens.add(candidate))
      },
    }, {decodeEntities: true})

    parser.write(text)
    parser.end()
    return tokens
  }
}

module.exports = HtmlSource
