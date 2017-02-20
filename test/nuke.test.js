const fs = require('fs')
const path = require('path')
const nuke = require('../lib/nuke')

describe('nuke.js', function () {
  const htmlContent = '<div class="foo-bar" id="something"></div>'
  const cssContent = fs.readFileSync(path.join(__dirname, '/fixtures/content.css'), 'utf8')

  it('should remove unused rules', function () {
    const result = nuke(htmlContent, cssContent)
    expect(result).to.not.contain('foobar[something=x]')
    expect(result).to.not.contain('.something3')
  })

  it('should remove empty media sets', function () {
    const result = nuke(htmlContent, cssContent)
    expect(result).to.not.contain('@media')
  })

  it('should respect nukecss:* comments', function () {
    const result = nuke(htmlContent, cssContent)
    expect(result).to.contain('.totally-unused')
  })
})
