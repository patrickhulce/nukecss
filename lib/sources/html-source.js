const _ = require('lodash')
const HtmlParser = require('htmlparser2').Parser
const ParsedSource = require('./parsed-source')

class HtmlSource extends ParsedSource {
  get type() {
    return 'html'
  }

  static get joiner() {
    return '\n<!-- joined by nukecss -->\n'
  }

  static parse(text) {
    const tokens = new Set()

    let error
    const parser = new HtmlParser({
      onopentag(name, attributes) {
        [name, attributes.id, attributes.class]
          .filter(candidate => typeof candidate === 'string')
          .forEach(candidate => tokens.add(candidate.toLowerCase()))
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

    return tokens
  }
}

module.exports = HtmlSource
