const _ = require('lodash')
const esprima = require('esprima')
const traverse = require('ast-traverse')
const ParsedSource = require('./parsed-source')

class JsSource extends ParsedSource {
  get type() {
    return 'js'
  }

  _findToken(selector) {
    if (this._options.strict) {
      return false
    } else if (selector.length === 0) {
      return true
    }

    for (let i = 1; i <= selector.length; i++) {
      const part = selector.substr(0, i)
      const rest = selector.substr(i)
      if (this._tokens.has(part) && this._findToken(rest)) {
        return true
      }
    }

    return false
  }

  static get joiner() {
    return ';\n/* joined by nukecss */\n'
  }

  static parse(text) {
    const ancestry = []
    const tokens = new Set()
    traverse(esprima.parse(text), {
      pre(node) {
        ancestry.push(node)
        if (node.type === 'Literal' && typeof node.value === 'string') {
          tokens.add(node.value)
        } else if (node.type === 'AssignmentExpression') {
          const identifierName = _.get(node, 'left.property.name')
          if (identifierName) {
            tokens.add(identifierName)
          }
        } else if (node.type === 'ObjectExpression') {
          node.properties.forEach(property => {
            if (property.key.type === 'Identifier') {
              tokens.add(property.key.name)
            }
          })
        }
      },
      post() {
        ancestry.pop()
      },
    })
    return {tokens}
  }
}

module.exports = JsSource
