const Source = require('./sources/source')
const CssParser = require('./css-parser')

module.exports = function (content, css, options) {
  const source = new Source(content)
  return new CssParser(css, [source]).pruned()
}
