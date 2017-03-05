const fs = require('fs')
const path = require('path')
const SourceMapConsumer = require('source-map').SourceMapConsumer
const nukecss = require('../lib/nuke')

describe('nuke.js', () => {
  context('when content is basic', () => {
    const htmlContent = fs.readFileSync(path.join(__dirname, '/fixtures/content.html'), 'utf8')
    const cssContent = fs.readFileSync(path.join(__dirname, '/fixtures/content.css'), 'utf8')

    it('should keep used rules', () => {
      const result = nukecss(htmlContent, cssContent)
      expect(result).to.contain('#something[title*=foo]:hover')
      expect(result).to.contain('.something')
    })

    it('should remove unused rules', () => {
      const result = nukecss(htmlContent, cssContent)
      expect(result).to.not.contain('foobar[something=x]')
      expect(result).to.not.contain('.something3')
      expect(result).to.not.contain('.foo-bar-3')
      expect(result).to.not.contain('madeup:not')
    })

    it('should remove empty media sets', () => {
      const result = nukecss(htmlContent, cssContent)
      expect(result).to.not.contain('@media')
    })

    it('should respect nukecss:* comments', () => {
      const result = nukecss(htmlContent, cssContent)
      expect(result).to.contain('.totally-unused')
    })

    it('should respect the whitelist', () => {
      const whitelist = ['foo-bar-3']
      const result = nukecss(htmlContent, cssContent, {whitelist})
      expect(result).to.contain('.foo-bar-3')
    })

    it('should respect the blacklist', () => {
      const blacklist = ['something']
      const extraHtml = '<div id="blacklist-test">test</div>'
      const extraCss = '\n.something, #blacklist-test { color: white; }'
      const result = nukecss([htmlContent, extraHtml], cssContent + extraCss, {blacklist})
      expect(result).to.contain('#blacklist-test')
    })

    it('should support multiple sources', () => {
      const result = nukecss([htmlContent, '<div id="foo-bar-3"></div>'], cssContent)
      expect(result).to.contain('.foo-bar-3')
    })
  })

  context('when content is parseable', () => {
    const jsContent = 'const jsignored = "js-class other-class"; const foo = "bar"'
    const moreJsContent = 'const woah = ["still", "works"].join("-")'
    const htmlContent = '<div id="primary" class="html-class">html-ignored</div>'
    const cssContent = `
      .jsignored { color: white; }
      .html-ignored { color: white; }
      .js-class { color: white; }
      .other-class { color: white; }
      .still-works { color: white; }
      .bar-still-works { color: white }
      .html-class { color: white; }
      #primary { color: white; }
      #primary > .unused { color: white; }
      .also-unused { color: white; }
    `.replace(/\n\s*/g, '\n')

    const nuked = nukecss([
      {content: jsContent, type: 'js'},
      {content: moreJsContent, type: 'js'},
      {content: htmlContent, type: 'html'},
    ], cssContent, {amalgamate: true})

    it('should remove unused rules', () => {
      expect(nuked).to.not.contain('#primary > .unused')
      expect(nuked).to.not.contain('.also-unused')
    })

    it('should not remove used rules', () => {
      expect(nuked).to.contain('.js-class')
      expect(nuked).to.contain('.other-class')
      expect(nuked).to.contain('.html-class')
      expect(nuked).to.contain('#primary')
    })

    it('should remove unused rules mentioned in non-strings', () => {
      expect(nuked).to.not.contain('jsignored')
    })

    it.skip('should remove unused rules mentioned in textnodes', () => {
      expect(nuked).to.not.contain('html-ignored')
    })

    it('should not remove unused rules dynamically joined', () => {
      expect(nuked).to.contain('.still-works')
      expect(nuked).to.contain('.bar-still-works')
    })
  })

  context('when sources are paths', () => {
    const filePath = 'file://' + path.join(__dirname, '/fixtures/content.html')
    const cssContent = fs.readFileSync(path.join(__dirname, '/fixtures/content.css'), 'utf8')

    it('should remove unused rules', () => {
      const result = nukecss(filePath, cssContent)
      expect(result).to.not.contain('foobar[something=x]')
      expect(result).to.not.contain('.something3')
      expect(result).to.not.contain('.foo-bar-3')
    })

    it('should remove empty media sets', () => {
      const result = nukecss(filePath, cssContent)
      expect(result).to.not.contain('@media')
    })

    it('should respect nukecss:* comments', () => {
      const result = nukecss(filePath, cssContent)
      expect(result).to.contain('.totally-unused')
    })
  })

  context('when sourceMaps are enabled', () => {
    const filePath = 'file://' + path.join(__dirname, '/fixtures/content.html')
    const cssContent = fs.readFileSync(path.join(__dirname, '/fixtures/content.css'), 'utf8')
    const sourceMap = {from: 'content.css', to: 'content.css', inline: false}
    const result = nukecss(filePath, cssContent, {sourceMap})

    function findLineAndColumn(css, string) {
      const lines = css.split('\n')
      const line = lines.findIndex(l => l.includes(string)) + 1
      if (line === -1) {
        throw new Error(`could not find string ${string}`)
      }

      const column = lines[line - 1].indexOf(string) + 1
      return {line, column}
    }

    it('should return an object', () => {
      expect(result).to.be.an('object')
      expect(result).to.have.property('css')
      expect(result).to.have.property('map')
    })

    it('should produce a valid sourcemap', () => {
      const string = '.something {'
      const realLocation = findLineAndColumn(cssContent, string)
      const location = findLineAndColumn(result.css, string)
      const consumer = new SourceMapConsumer(result.map)

      const sourceMapPosition = consumer.originalPositionFor(location)
      expect(sourceMapPosition.line).to.be.greaterThan(location.line)
      expect(sourceMapPosition.line).to.equal(realLocation.line)
    })
  })
})
