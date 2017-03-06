const fs = require('fs')
const path = require('path')
const glob = require('glob')

const _ = require('lodash')

const SimpleSource = require('./simple-source')
const JsSource = require('./js-source')
const HtmlSource = require('./html-source')

const FILE_PREFIX = 'file://'

class SourceFactory {
  static from(sources, opts = {}) {
    sources = Array.isArray(sources) ? sources : [sources]
    sources = _(sources)
      .map(source => {
        if (typeof source === 'string') {
          return SourceFactory.fromString(source, opts)
        } else if (typeof source === 'object') {
          return SourceFactory.fromObject(source, opts)
        } else {
          throw new Error(`invalid source: ${source}`)
        }
      })
      .flatten()
      .value()

    if (opts.amalgamate) {
      sources = _(sources)
        .groupBy('type')
        .mapValues(sources => sources.reduce((sourceA, sourceB) => sourceA.join(sourceB)))
        .values()
        .value()
    }

    return sources
  }

  static fromString(source, opts = {}) {
    const isFile = source.startsWith(FILE_PREFIX)
    const key = isFile ? 'path' : 'content'
    const value = isFile ? source.substr(FILE_PREFIX.length) : source
    return SourceFactory.fromObject({[key]: value}, opts)
  }

  static fromObject(source, opts = {}) {
    const files = source.path ?
      SourceFactory._readFromGlobPath(source.path, source.type) :
      [{type: source.type, content: source.content}]

    return _(files)
      .map(file => SourceFactory._createSource(file, opts))
      .flatten()
      .value()
  }

  static _readFromGlobPath(globPath, fileType) {
    return glob.sync(globPath).map(file => {
      return {
        type: fileType || path.extname(file).replace(/\./, ''),
        content: fs.readFileSync(file, 'utf8'),
      }
    })
  }

  static _createSource(file, opts) {
    if (file.type === 'js' && !opts.simple) {
      return JsSource.from(file.content)
    } else if (file.type === 'html' && !opts.simple) {
      return HtmlSource.from(file.content)
    }

    return new SimpleSource(file.content)
  }
}

module.exports = SourceFactory
