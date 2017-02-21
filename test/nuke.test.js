const fs = require('fs')
const path = require('path')
const nuke = require('../lib/nuke')

describe('nuke.js', function () {
  const htmlContent = fs.readFileSync(path.join(__dirname, '/fixtures/content.html'), 'utf8')
  const cssContent = fs.readFileSync(path.join(__dirname, '/fixtures/content.css'), 'utf8')

  it('should remove unused rules', function () {
    const result = nuke(htmlContent, cssContent)
    expect(result).to.not.contain('foobar[something=x]')
    expect(result).to.not.contain('.something3')
    expect(result).to.not.contain('.foo-bar-3')
  })

  it('should remove empty media sets', function () {
    const result = nuke(htmlContent, cssContent)
    expect(result).to.not.contain('@media')
  })

  it('should respect nukecss:* comments', function () {
    const result = nuke(htmlContent, cssContent)
    expect(result).to.contain('.totally-unused')
  })

  it('should support multiple sources', function () {
    const result = nuke([htmlContent, '<div id="foo-bar-3"></div>'], cssContent)
    expect(result).to.contain('.foo-bar-3')
  })
})
