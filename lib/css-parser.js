const _ = require('lodash')
const gonzales = require('gonzales-pe')

const IGNORE_COMMENT_REGEX = /\bprunedcss:ignore\b/

class CssParser {
  constructor(content, corpra) {
    this._content = content
    this._corpra = corpra
    this._parsed = gonzales.parse(content)
    this._usedTokens = new Set()
  }

  pruned() {
    let ignoreRules = false
    this._parsed.traverse((rule, index, parent) => {
      Object.defineProperty(rule, 'parent', {get: _.constant(parent)})

      if (rule.type === 'multilineComment' && IGNORE_COMMENT_REGEX.test(rule.content)) {
        ignoreRules = !ignoreRules;
      } else if (rule.type === 'ruleset') {
        const selectors = []
        rule.traverseByType('selector', node => selectors.push(this.getSelectorTokens(node)))
        const usedSelectors = selectors.filter(s => this.findUsedSelector(s))
        if (usedSelectors.length === 0) {
          parent.removeChild(index)
        }
      }
    })

    return this._parsed.toString()
  }

  getSelectorTokens(parsed) {
    const tokens = []
    parsed.traverseByTypes(['id', 'class', 'typeSelector'], node => {
      const content = _.get(node, 'content.0.content', '')
      if (node.type === 'typeSelector' && ['html', 'body'].includes(content)) {
        return
      }

      tokens.push(content)
    })

    return tokens;
  }

  findUsedSelector(tokens) {
    return _.every(tokens, token => {
      if (this._usedTokens.has(token)) {
        return true;
      }

      const found = _.find(this._corpra, corpus => corpus.contains(token))
      if (found) {
        this._usedTokens.add(token)
      }

      return found
    })
  }
}

module.exports = CssParser
