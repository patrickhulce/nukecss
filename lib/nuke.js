const postcss = require('postcss')
const plugin = require('./plugin')

function nuke(sources, css, opts) {
  const processor = postcss([plugin(sources, opts)])
  return processor.process(css).css
}

module.exports = nuke
module.exports.plugin = plugin
