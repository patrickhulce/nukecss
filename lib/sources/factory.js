const fs = require('fs')
const path = require('path')
const glob = require('glob')

const _ = require('lodash')

const Source = require('./source')
const JsSource = require('./js-source')

const FILE_PREFIX = 'file://'

class SourceFactory {
  static fromString(source, opts) {
    const isFile = source.startsWith(FILE_PREFIX)
    const key = isFile ? 'path' : 'content'
    const value = isFile ? source.substr(FILE_PREFIX.length) : source
    return SourceFactory.fromObject({[key]: value}, opts)
  }

  static fromObject(source, opts) {
    let files = [{type: source.type, content: source.content}]
    if (source.path) {
      files = glob.sync(source.path).map(file => {
        return {
          type: source.type || path.extname(file).replace(/\./, ''),
          content: fs.readFileSync(file, 'utf8'),
        }
      })
    }

    return files.map(file => {
      if (file.type === 'js' && !opts.simple) {
        return new JsSource(file.content)
      }

      return new Source(file.content)
    })
  }

  static from(sources, opts) {
    opts = opts || {}
    sources = Array.isArray(sources) ? sources : [sources]

    return _(sources)
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
  }
}

module.exports = SourceFactory
