const path = require('path')
const SourceFactory = require('../../lib/sources/factory.js')

describe('sources/factory.js', () => {
  describe('#from', () => {
    it('should always return an array', () => {
      const sources = SourceFactory.from('foobar')
      expect(sources).to.be.an.instanceof(Array)
      expect(sources).to.have.length(1)
    })

    it('should work with strings', () => {
      const sources = SourceFactory.from(['foobar'])
      expect(sources).to.have.length(1)
      expect(sources[0].contains('foobar')).to.equal(true)
    })

    it('should work with objects', () => {
      const content = 'const foobar = "baz"'
      const sources = SourceFactory.from([{content, type: 'js'}])
      expect(sources).to.have.length(1)
      expect(sources[0].contains('foobar')).to.equal(false)
      expect(sources[0].contains('baz')).to.equal(true)
    })

    context('when opts.amalgamate=true', () => {
      const opts = {amalgamate: true}

      it('should join sources of same type', () => {
        const filePath = path.join(__dirname, '../fixtures/*.js')
        const sources = SourceFactory.from({path: filePath}, opts)
        expect(sources).to.have.length(1)
        expect(sources[0].contains('baz-bam')).to.equal(true)
      })

      it('should not join sources of different type', () => {
        const filePath = path.join(__dirname, '../fixtures/*.@(js|html)')
        const sources = SourceFactory.from({path: filePath}, opts)
        expect(sources).to.have.length(2)
      })

      it('should work with already specified content', () => {
        const raw = [
          {content: 'const foo = "baz"', type: 'js'},
          {content: 'const bar = "-bam"', type: 'js'},
        ]

        const sources = SourceFactory.from(raw, opts)
        expect(sources).to.have.length(1)
        expect(sources[0].contains('baz-bam')).to.equal(true)
      })
    })
  })

  describe('#fromString', () => {
    it('should convert file paths to content', () => {
      const filePath = path.join(__dirname, '../fixtures/content.html')
      const sources = SourceFactory.fromString(`file://${filePath}`)
      expect(sources).to.have.length(1)
      expect(sources[0].contains('something')).to.equal(true)
    })
  })

  describe('#fromObject', () => {
    it('should convert file paths to content', () => {
      const filePath = path.join(__dirname, '../fixtures/content.html')
      const sources = SourceFactory.fromObject({path: filePath})
      expect(sources).to.have.length(1)
      expect(sources[0].contains('something')).to.equal(true)
    })

    it('should support globs', () => {
      const filePath = path.join(__dirname, '../fixtures/*.html')
      const sources = SourceFactory.fromObject({path: filePath})
      expect(sources).to.have.length(2)
    })

    it('should use the proper source', () => {
      const content = 'const foobar = "baz"'
      const sources = SourceFactory.fromObject({content, type: 'js'})
      expect(sources).to.have.length(1)
      expect(sources[0].contains('foobar')).to.equal(false)
      expect(sources[0].contains('baz')).to.equal(true)
    })

    it('should infer the proper source type from the extension', () => {
      const filePath = path.join(__dirname, '../fixtures/content.js')
      const sources = SourceFactory.fromObject({path: filePath})
      expect(sources).to.have.length(1)
      expect(sources[0].contains('foobar')).to.equal(false)
      expect(sources[0].contains('baz')).to.equal(true)
    })

    context('when opts.simple=true', () => {
      const opts = {simple: true}
      it('should always use SimpleSource', () => {
        const content = 'const foobar = "baz"'
        const sources = SourceFactory.fromObject({content, type: 'js'}, opts)
        expect(sources).to.have.length(1)
        expect(sources[0].contains('foobar')).to.equal(true)
        expect(sources[0].contains('baz')).to.equal(true)
      })
    })
  })
})
