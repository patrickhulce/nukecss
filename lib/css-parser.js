const _ = require('lodash')
const gonzales = require('gonzales-pe')

const IGNORE_COMMENT_REGEX = /\bprunedcss:ignore\b/

function hasParentOfType(type) {
  let node = this.parent
  while (node) {
    if (node.type === type) {
      return node
    }

    node = node.parent
  }

  return false
}

// TODO(patrickhulce): stop using exceptions for flow control :(
function hasChildrenOfType(type) {
  try {
    this.traverseByType(type, () => {
      // escape early
      throw new Error('yes')
    })
  } catch (err) {
    return err.message === 'yes'
  }

  return false
}

class CssParser {
  constructor(content, corpra) {
    this._content = content
    this._corpra = corpra
    this._parsed = gonzales.parse(content)
    this._usedTokens = new Set()
  }

  wrapNode(node, parent) {
    Object.defineProperty(node, 'parent', {get: _.constant(parent)})
    Object.defineProperty(node, 'hasParentOfType', {value: hasParentOfType})
    Object.defineProperty(node, 'hasChildrenOfType', {value: hasChildrenOfType})
  }

  pruned() {
    let ignoreRules = false
    this._parsed.traverse((rule, index, parent) => {
      this.wrapNode(rule)

      if (rule.type === 'multilineComment' && IGNORE_COMMENT_REGEX.test(rule.content)) {
        ignoreRules = !ignoreRules
      } else if (rule.type === 'ruleset') {
        const atRuleParent = rule.hasParentOfType('atrule')
        if (atRuleParent && atRuleParent.content[0].content[0].content === 'keyframes') {
          return
        }

        const selectors = []
        rule.traverseByType('selector', node => selectors.push(this.getSelectorTokens(node)))
        const usedSelectors = selectors.filter(s => this.findUsedSelector(s))
        if (usedSelectors.length === 0) {
          parent.removeChild(index)
        }
      }
    })

    this._parsed.traverseByType('atrule', (node, index, parent) => {
      if (!node.hasChildrenOfType('ruleset')) {
        parent.removeChild(index)
      }
    })

    return this._parsed.toString().trim()
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

    return tokens
  }

  findUsedSelector(tokens) {
    return _.every(tokens, token => {
      if (this._usedTokens.has(token)) {
        return true
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
