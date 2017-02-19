const fs = require('fs')
const path = require('path')
const prune = require('../lib/prune')

describe('prune.js', function () {
  const cssContent = fs.readFileSync(path.join(__dirname, '/fixtures/content.css'), 'utf8')

  it('should remove unused rules', function () {
    const html = '<div class="foo-bar" id="something"></div>'
    const result = prune(html, cssContent)
    expect(result).to.have.property('length').greaterThan(10).lessThan(120)
    expect(result).to.not.contain('foobar[something=x]')
    expect(result).to.not.contain('.something3')
  })

  it('should remove empty media sets', function () {
    const html = '<div class="foo-bar" id="something"></div>'
    const result = prune(html, cssContent)
    expect(result).to.not.contain('@media')
  })
})
