const postcss = require('postcss')

const SourceFactory = require('./sources/factory')
const CssNuker = require('./css-nuker')
const PostCssParser = require('./parser/postcss')

function createPlugin(sources, options) {
  sources = SourceFactory.from(sources, options)

  return parsed => {
    const parser = new PostCssParser(parsed)
    const nuker = new CssNuker(sources, parser, options)
    nuker.nuke()
  }
}

module.exports = postcss.plugin('nukecss', createPlugin)
