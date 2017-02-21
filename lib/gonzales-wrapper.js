const _ = require('lodash')

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

function hasChildrenOfType(type) {
  let found = false
  this.traverseByType(type, () => {
    found = true
  })
  return found
}

function isKeyframesAtRule() {
  return _.get(this, 'content.0.content.0.content') === 'keyframes'
}

module.exports = function (node, parent) {
  Object.defineProperty(node, 'parent', {get: () => parent})
  Object.defineProperty(node, 'isKeyframesAtRule', {get: isKeyframesAtRule})
  Object.defineProperty(node, 'hasParentOfType', {value: hasParentOfType})
  Object.defineProperty(node, 'hasChildrenOfType', {value: hasChildrenOfType})
}
