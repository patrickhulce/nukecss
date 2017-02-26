const Source = require('./sources/source')
const JsSource = require('./sources/js-source')
const CssNuker = require('./css-nuker')
const GonzalesParser = require('./parser/gonzales')

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

module.exports = function (sources, css) {
  sources = Array.isArray(sources) ? sources : [sources]
  sources = sources.map(toSource)
  return new CssNuker(sources, css, GonzalesParser).nuked()
}
