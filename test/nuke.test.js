const fs = require('fs')
const path = require('path')
const nukecss = require('../lib/nuke')

describe('nuke.js', function () {
  context('when content is basic', () => {
    const htmlContent = fs.readFileSync(path.join(__dirname, '/fixtures/content.html'), 'utf8')
    const cssContent = fs.readFileSync(path.join(__dirname, '/fixtures/content.css'), 'utf8')

    it('should remove unused rules', function () {
      const result = nukecss(htmlContent, cssContent)
      expect(result).to.not.contain('foobar[something=x]')
      expect(result).to.not.contain('.something3')
      expect(result).to.not.contain('.foo-bar-3')
    })

    it('should remove empty media sets', function () {
      const result = nukecss(htmlContent, cssContent)
      expect(result).to.not.contain('@media')
    })

    it('should respect nukecss:* comments', function () {
      const result = nukecss(htmlContent, cssContent)
      expect(result).to.contain('.totally-unused')
    })

    it('should support multiple sources', function () {
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

    it('should remove unused rules', function () {
      expect(nuked).to.not.contain('#primary > .unused')
      expect(nuked).to.not.contain('.also-unused')
    })

    it('should not remove used rules', function () {
      expect(nuked).to.contain('.js-class')
      expect(nuked).to.contain('.other-class')
      expect(nuked).to.contain('.html-class')
      expect(nuked).to.contain('#primary')
    })

    it('should remove unused rules mentioned in non-strings', function () {
      expect(nuked).to.not.contain('jsignored')
    })

    it.skip('should remove unused rules mentioned in textnodes', function () {
      expect(nuked).to.not.contain('html-ignored')
    })

    it('should not remove unused rules dynamically joined', function () {
      expect(nuked).to.contain('.still-works')
      expect(nuked).to.contain('.bar-still-works')
    })
  })

  context('when sources are paths', () => {
    const filePath = 'file://' + path.join(__dirname, '/fixtures/content.html')
    const cssContent = fs.readFileSync(path.join(__dirname, '/fixtures/content.css'), 'utf8')

    it('should remove unused rules', function () {
      const result = nukecss(filePath, cssContent)
      expect(result).to.not.contain('foobar[something=x]')
      expect(result).to.not.contain('.something3')
      expect(result).to.not.contain('.foo-bar-3')
    })

    it('should remove empty media sets', function () {
      const result = nukecss(filePath, cssContent)
      expect(result).to.not.contain('@media')
    })

    it('should respect nukecss:* comments', function () {
      const result = nukecss(filePath, cssContent)
      expect(result).to.contain('.totally-unused')
    })
  })
})
