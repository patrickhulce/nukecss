const _ = require('lodash')

const ENABLE_COMMENT_REGEX = /\bnukecss:enable\b/
const DISABLE_COMMENT_REGEX = /\bnukecss:disable\b/

class CssNuker {
  constructor(sources, parser, options = {}) {
    this._options = options
    this._sources = sources
    this._parser = parser

    this._enabled = true
    this._usedTokens = new Set()
    this._blacklistedTokens = new Set()

    if (options.whitelist) {
      options.whitelist.forEach(token => this._usedTokens.add(token))
    }

    if (options.blacklist) {
      options.blacklist.forEach(token => this._blacklistedTokens.add(token))
    }
  }

  nuke() {
    this._parser.traverse(this._handleComment.bind(this), this._handleRuleset.bind(this))
    this._parser.removeEmptyAtRules()
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
      } else if (this._blacklistedTokens.has(token)) {
        return false
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
