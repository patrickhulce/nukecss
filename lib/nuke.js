const postcss = require('postcss')

const Source = require('./sources/source')
const JsSource = require('./sources/js-source')
const CssNuker = require('./css-nuker')
const PostCssParser = require('./parser/postcss')

function toSource(source) {
  if (typeof source === 'string') {
    return new Source(source)
  } else if (typeof source === 'object') {
    if (source.type === 'js') {
      return new JsSource(source.content)
    }

    return new Source(source.content)
  } else {
    throw new Error(`invalid source: ${source}`)
  }
}

function nuke(sources, css) {
  sources = Array.isArray(sources) ? sources : [sources]
  sources = sources.map(toSource)
  const parser = new PostCssParser(css)
  const nuker = new CssNuker(sources, parser)
  nuker.nuke()
  return parser.content
}

function createPlugin(opts) {
  const sources = opts.sources.map(toSource)
  return parsed => {
    const parser = new PostCssParser(parsed)
    const nuker = new CssNuker(sources, parser)
    nuker.nuke()
  }
}

module.exports = nuke
module.exports.plugin = postcss.plugin('nukecss', createPlugin)
