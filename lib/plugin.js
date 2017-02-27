const postcss = require('postcss')

const SourceFactory = require('./sources/factory')
const CssNuker = require('./css-nuker')
const PostCssParser = require('./parser/postcss')

function createPlugin(sources, opts) {
  sources = SourceFactory.from(sources, opts)

  return parsed => {
    const parser = new PostCssParser(parsed)
    const nuker = new CssNuker(sources, parser, opts)
    nuker.nuke()
  }
}

module.exports = postcss.plugin('nukecss', createPlugin)
