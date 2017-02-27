const _ = require('lodash')
const gonzales = require('gonzales-pe')

class GonzalesParser {
  static getSelectorTokensInRuleset(parsed) {
    const selectors = []
    parsed.traverseByType('selector', node => {
      const tokens = GonzalesParser.getTokensInSelector(node)
      selectors.push({node, tokens})
    })

    return selectors
  }

  static getTokensInSelector(parsed) {
    const tokens = []
    parsed.traverseByTypes(['id', 'class', 'typeSelector'], node => {
      const content = _.get(node, 'content.0.content', '')
      if (node.type === 'typeSelector' && ['html', 'body'].includes(content)) {
        return
      }

      tokens.push(content)
    })

    return tokens
  }

  static getRulesetFromSelectorsString(content) {
    return gonzales.parse(`${content} {}`)
  }
}

module.exports = GonzalesParser
