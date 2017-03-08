const _ = require('lodash')
const HtmlParser = require('htmlparser2').Parser
const ParsedSource = require('./parsed-source')
const JsSource = require('./js-source')

const DEFAULT_ATTRIBUTES = ['id', 'class', 'ng-class', 'data-ng-class']

class HtmlSource extends ParsedSource {
  get type() {
    return 'html'
  }

  _findToken(selector) {
    return _.find(this._parsed.children, source => source.contains(selector))
  }

  static get joiner() {
    return '\n<!-- joined by nukecss -->\n'
  }

  static parse(text, opts) {
    const tokens = new Set()
    const children = []
    const attributeKeys = _.get(opts, 'html.attributes', DEFAULT_ATTRIBUTES)

    let error
    let innerText
    const parser = new HtmlParser({
      onopentag(name, attributes) {
        const attributeValues = Array.isArray(attributeKeys) ?
          attributeKeys.map(key => attributes[key]) : []
        attributeValues.concat([name])
          .filter(candidate => typeof candidate === 'string')
          .forEach(candidate => tokens.add(candidate.toLowerCase()))
      },
      ontext(value) {
        innerText = value
      },
      onclosetag(name) {
        if (name === 'script' && innerText) {
          children.push(JsSource.from(innerText))
        }
      },
      onerror(err) {
        error = err
      },
    }, {decodeEntities: true})

    parser.write(text)
    parser.end()

    if (error) {
      throw error
    } else if (text.length > 0 && !tokens.size) {
      throw new Error('No tokens found')
    }

    return {tokens, children}
  }
}

module.exports = HtmlSource
