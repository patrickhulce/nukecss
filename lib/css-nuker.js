const _ = require('lodash')
const gonzales = require('gonzales-pe')
const wrapGonzalesNode = require('./gonzales-wrapper')

const ENABLE_COMMENT_REGEX = /\bnukecss:enable\b/
const DISABLE_COMMENT_REGEX = /\bnukecss:disable\b/

class CssNuker {
  constructor(sources, content) {
    this._sources = sources
    this._content = content
    this._parsed = gonzales.parse(content)

    this._enabled = true
    this._usedTokens = new Set()
  }

  handleComment(node, index, parent) {
    if (ENABLE_COMMENT_REGEX.test(node.content)) {
      this._enabled = true
      parent.removeChild(index)
    } else if (DISABLE_COMMENT_REGEX.test(node.content)) {
      this._enabled = false
      parent.removeChild(index)
    }
  }

  handleRuleset(ruleset, index, parent) {
    const atRuleParent = ruleset.hasParentOfType('atrule')
    if (atRuleParent && atRuleParent.isKeyframesAtRule) {
      return
    }

    const selectors = []
    ruleset.traverseByType('selector', node => {
      const tokens = this.getTokensInSelector(node)
      selectors.push({node, tokens})
    })

    const usedSelectors = selectors.filter(selector => this.isEveryTokenUsed(selector.tokens))
    if (usedSelectors.length === 0) {
      parent.removeChild(index)
    }
  }

  removeEmptyAtRules() {
    this._parsed.traverseByType('atrule', (node, index, parent) => {
      if (!node.hasChildrenOfType('ruleset')) {
        parent.removeChild(index)
      }
    })
  }

  nuked() {
    this._parsed.traverse((node, index, parent) => {
      wrapGonzalesNode(node)

      if (node.type === 'multilineComment') {
        this.handleComment(node, index, parent)
      } else if (this._enabled && node.type === 'ruleset') {
        this.handleRuleset(node, index, parent)
      }
    })

    this.removeEmptyAtRules()
    return this._parsed.toString().trim()
  }

  getTokensInSelector(parsed) {
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

  isEveryTokenUsed(tokens) {
    return _.every(tokens, token => {
      if (this._usedTokens.has(token)) {
        return true
      }

      const found = _.find(this._sources, source => source.contains(token))
      if (found) {
        this._usedTokens.add(token)
      }

      return found
    })
  }
}

module.exports = CssNuker
