const Source = require('./sources/source')
const CssNuker = require('./css-nuker')

function toSource(source) {
  if (typeof source === 'string') {
    return new Source(source)
  } else if (typeof source === 'object') {
    return new Source(source.content)
  } else {
    throw new Error(`invalid source: ${source}`)
  }
}

module.exports = function (sources, css) {
  sources = Array.isArray(sources) ? sources : [sources]
  sources = sources.map(toSource)
  return new CssNuker(sources, css).nuked()
}
