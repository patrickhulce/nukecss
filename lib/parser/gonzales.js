const _ = require('lodash')
const gonzales = require('gonzales-pe')
const wrapGonzalesNode = require('./gonzales-node-wrapper')

class GonzalesParser {
  constructor(content) {
    this._parsed = gonzales.parse(content)
  }

  get content() {
    return this._parsed.toString().trim()
  }

  get parsed() {
    return this._parsed
  }

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

  traverse(handleComment, handleRuleset) {
    this._parsed.traverse((node, index, parent) => {
      wrapGonzalesNode(node)

      const remove = () => parent.removeChild(index)
      if (node.type === 'multilineComment') {
        handleComment(node.content, remove)
      } else if (node.type === 'ruleset') {
        handleRuleset(node, remove)
      }
    })
  }

  removeEmptyAtRules() {
    this._parsed.traverseByType('atrule', (node, index, parent) => {
      if (!node.hasChildrenOfType('ruleset')) {
        parent.removeChild(index)
      }
    })
  }

  isRulesetKeyframes(ruleset) {
    const atRuleParent = ruleset.hasParentOfType('atrule')
    return Boolean(atRuleParent && atRuleParent.isKeyframesAtRule)
  }

  getSelectorsFromRuleset(ruleset) {
    return GonzalesParser.getSelectorTokensInRuleset(ruleset)
  }
}

module.exports = GonzalesParser
