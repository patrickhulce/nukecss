const _ = require('lodash')

const ENABLE_COMMENT_REGEX = /\bnukecss:enable\b/
const DISABLE_COMMENT_REGEX = /\bnukecss:disable\b/

class CssNuker {
  constructor(sources, content, Parser) {
    this._sources = sources
    this._content = content
    this._parser = new Parser(content)

    this._enabled = true
    this._usedTokens = new Set()
  }

  nuked() {
    this._parser.traverse(this._handleComment.bind(this), this._handleRuleset.bind(this))
    this._parser.removeEmptyAtRules()
    return this._parser.content
  }

  _handleComment(content, remove) {
    if (ENABLE_COMMENT_REGEX.test(content)) {
      this._enabled = true
      remove()
    } else if (DISABLE_COMMENT_REGEX.test(content)) {
      this._enabled = false
      remove()
    }
  }

  _handleRuleset(ruleset, remove) {
    if (!this._enabled || this._parser.isRulesetKeyframes(ruleset)) {
      return
    }

    const selectors = this._parser.getSelectorsFromRuleset(ruleset)
    const usedSelectors = selectors.filter(selector => this._isEveryTokenUsed(selector.tokens))
    if (usedSelectors.length === 0) {
      remove()
    }
  }

  _isEveryTokenUsed(tokens) {
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
