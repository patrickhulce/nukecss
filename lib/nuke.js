const postcss = require('postcss')
const plugin = require('./plugin')

function nuke(sources, css) {
  const processor = postcss([plugin(sources)])
  return processor.process(css).css
}

module.exports = nuke
module.exports.plugin = plugin
