const _ = require('lodash')
const postcss = require('postcss')
const plugin = require('./plugin')

function toPostcssOptions(options) {
  if (options.sourceMap) {
    const mainOptions = _.pick(options.sourceMap, ['from', 'to'])
    const map = _.pick(options.sourceMap, ['inline'])
    return Object.assign(mainOptions, {map})
  }
}

function nuke(sources, css, options = {}) {
  const processor = postcss([plugin(sources, options)])
  const processed = processor.process(css, toPostcssOptions(options))
  return options.sourceMap ?
    {css: processed.css, map: JSON.parse(processed.map.toString())} :
    processed.css
}

module.exports = nuke
module.exports.plugin = plugin
