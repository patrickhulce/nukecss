const fs = require('fs')
const path = require('path')
const glob = require('glob')

const _ = require('lodash')

const SimpleSource = require('./simple-source')
const JsSource = require('./js-source')
const HtmlSource = require('./html-source')

const FILE_PREFIX = 'file://'

class SourceFactory {
  static from(sources, options = {}) {
    sources = Array.isArray(sources) ? sources : [sources]
    sources = _(sources)
      .map(source => {
        if (typeof source === 'string') {
          return SourceFactory.fromString(source, options)
        } else if (typeof source === 'object') {
          return SourceFactory.fromObject(source, options)
        } else {
          throw new TypeError(`invalid source: ${source}`)
        }
      })
      .flatten()
      .value()

    if (options.amalgamate) {
      sources = _(sources)
        .groupBy('type')
        .mapValues(sources => sources.reduce((sourceA, sourceB) => sourceA.join(sourceB)))
        .values()
        .value()
    }

    return sources
  }

  static fromString(source, options = {}) {
    const isFile = source.startsWith(FILE_PREFIX)
    const key = isFile ? 'path' : 'content'
    const value = isFile ? source.substr(FILE_PREFIX.length) : source
    return SourceFactory.fromObject({[key]: value}, options)
  }

  static fromObject(source, options = {}) {
    const files = source.path ?
      SourceFactory._readFromGlobPath(source.path, source.type) :
      [{type: source.type, content: source.content}]

    return _(files)
      .map(file => SourceFactory._createSource(file, options))
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

  static _createSource(file, options) {
    if (file.type === 'js' && !options.simple) {
      return JsSource.from(file.content)
    } else if (file.type === 'html' && !options.simple) {
      return HtmlSource.from(file.content)
    }

    return new SimpleSource(file.content)
  }
}

module.exports = SourceFactory
