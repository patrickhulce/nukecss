const _ = require('lodash')
const postcss = require('postcss')
const GonzalesParser = require('./gonzales')

class PostCssParser {
  constructor(contentOrParsed) {
    this._parsed = typeof contentOrParsed === 'string' ?
      postcss.parse(contentOrParsed) : contentOrParsed
  }

  traverse(handleComment, handleRuleset) {
    this._parsed.walk(node => {
      if (node.type === 'comment') {
        handleComment(node.text, () => node.remove())
      } else if (node.type === 'rule') {
        handleRuleset(node, () => node.remove())
      }
    })
  }

  removeEmptyAtRules() {
    this._parsed.walkAtRules(node => {
      if (node.nodes.length === 0) {
        node.remove()
      }
    })
  }

  isRulesetKeyframes(ruleset) {
    return ruleset.parent.type === 'atrule' && _.endsWith(ruleset.parent.name, 'keyframes')
  }

  getSelectorsFromRuleset(ruleset) {
    const gonzalesNode = GonzalesParser.getRulesetFromSelectorsString(ruleset.selector)
    return GonzalesParser.getSelectorTokensInRuleset(gonzalesNode)
  }
}

module.exports = PostCssParser
