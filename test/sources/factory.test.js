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
      expect(sources[0]).to.contain('foobar')
    })

    it('should work with objects', () => {
      const content = 'const foobar = "baz"'
      const sources = SourceFactory.from([{content, type: 'js'}])
      expect(sources).to.have.length(1)
      expect(sources[0]).to.not.contain('foobar')
      expect(sources[0]).to.contain('baz')
    })

    context('when opts.amalgamate=true', () => {
      const opts = {amalgamate: true}

      it('should join sources of same type', () => {
        const filePath = path.join(__dirname, '../fixtures/*.js')
        const sources = SourceFactory.from({path: filePath}, opts)
        expect(sources).to.have.length(1)
        expect(sources[0]).to.contain('baz-bam')
      })

      it('should not join sources of different type', () => {
        const filePath = path.join(__dirname, '../fixtures/*.@(js|html)')
        const sources = SourceFactory.from({path: filePath}, opts)
        expect(sources).to.have.length(2)
      })

      it('should work with malformed content', () => {
        const raw = [
          {content: 'const foo = "baz"', type: 'js'},
          {content: 'const !=< what', type: 'js'},
        ]

        const sources = SourceFactory.from(raw, opts)
        expect(sources).to.have.length(2)
        expect(sources[0]).to.contain('baz')
        expect(sources[0]).to.not.contain('foo')
        expect(sources[1]).to.contain('what')
      })

      it('should work with already specified content', () => {
        const raw = [
          {content: 'const foo = "baz"', type: 'js'},
          {content: 'const bar = "-bam"', type: 'js'},
        ]

        const sources = SourceFactory.from(raw, opts)
        expect(sources).to.have.length(1)
        expect(sources[0]).to.contain('baz-bam')
      })
    })
  })

  describe('#fromString', () => {
    it('should convert file paths to content', () => {
      const filePath = path.join(__dirname, '../fixtures/content.html')
      const sources = SourceFactory.fromString(`file://${filePath}`)
      expect(sources).to.have.length(1)
      expect(sources[0]).to.contain('something')
    })
  })

  describe('#fromObject', () => {
    it('should convert file paths to content', () => {
      const filePath = path.join(__dirname, '../fixtures/content.html')
      const sources = SourceFactory.fromObject({path: filePath})
      expect(sources).to.have.length(1)
      expect(sources[0]).to.contain('something')
    })

    it('should support globs', () => {
      const filePath = path.join(__dirname, '../fixtures/*.html')
      const sources = SourceFactory.fromObject({path: filePath})
      expect(sources).to.have.length(2)
    })

    it('should use JsSource', () => {
      const content = 'const foobar = "baz"'
      const sources = SourceFactory.fromObject({content, type: 'js'})
      expect(sources).to.have.length(1)
      expect(sources[0]).to.not.contain('foobar')
      expect(sources[0]).to.contain('baz')
    })

    it('should use HtmlSource', () => {
      const content = '<html><p class="baz">foobar</p></html>'
      const sources = SourceFactory.fromObject({content, type: 'html'})
      expect(sources).to.have.length(1)
      expect(sources[0]).to.not.contain('foobar')
      expect(sources[0]).to.contain('baz')
    })

    it('should infer the proper source type from the extension', () => {
      const filePath = path.join(__dirname, '../fixtures/content.js')
      const sources = SourceFactory.fromObject({path: filePath})
      expect(sources).to.have.length(1)
      expect(sources[0]).to.not.contain('foobar')
      expect(sources[0]).to.contain('baz')
    })

    context('when opts.simple=true', () => {
      const opts = {simple: true}
      it('should always use SimpleSource', () => {
        const content = 'const foobar = "baz"'
        const sources = SourceFactory.fromObject({content, type: 'js'}, opts)
        expect(sources).to.have.length(1)
        expect(sources[0]).to.contain('foobar')
        expect(sources[0]).to.contain('baz')
      })
    })
  })
})
