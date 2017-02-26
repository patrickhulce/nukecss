const _ = require('lodash')
const gonzales = require('gonzales-pe')
const wrapGonzalesNode = require('./gonzales-node-wrapper')

class GonzalesParser {
  constructor(content) {
    this._parsed = gonzales.parse(content)
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

  static getNodeFromSelectorsString(content) {
    return gonzales.parse(`${content} {}`)
  }

  get content() {
    return this._parsed.toString().trim()
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
    const selectors = []
    ruleset.traverseByType('selector', node => {
      const tokens = GonzalesParser.getTokensInSelector(node)
      selectors.push({node, tokens})
    })

    return selectors
  }
}

module.exports = GonzalesParser
