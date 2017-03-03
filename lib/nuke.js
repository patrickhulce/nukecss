const _ = require('lodash')
const postcss = require('postcss')
const plugin = require('./plugin')

function toPostcssOpts(opts) {
  if (opts.sourceMap) {
    const mainOpts = _.pick(opts.sourceMap, ['from', 'to'])
    const map = _.pick(opts.sourceMap, ['inline'])
    return Object.assign(mainOpts, {map})
  }
}

function nuke(sources, css, opts = {}) {
  const processor = postcss([plugin(sources, opts)])
  const processed = processor.process(css, toPostcssOpts(opts))
  return opts.sourceMap ?
    {css: processed.css, map: JSON.parse(processed.map.toString())} :
    processed.css
}

module.exports = nuke
module.exports.plugin = plugin
