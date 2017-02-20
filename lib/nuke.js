const Source = require('./sources/source')
const CssParser = require('./css-parser')

function toSource(source) {
  if (typeof source === 'string') {
    return new Source(source)
  } else if (typeof source === 'object') {
    return new Source(source.content)
  } else {
    throw new Error(`invalid source: ${source}`)
  }
}

module.exports = function (content, css) {
  let sources = Array.isArray(content) ? content : [content]
  sources = sources.map(toSource)
  return new CssParser(css, sources).nuked()
}
