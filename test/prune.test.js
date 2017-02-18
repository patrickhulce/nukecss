const fs = require('fs')
const path = require('path')
const prune = require('../lib/prune')

describe('prune.js', function () {
  it('should work', function () {
    const html = '<div class="foo-bar" id="something"></div>'
    const css = fs.readFileSync(path.join(__dirname, '/fixtures/content.css'), 'utf8')
    expect(prune(html, css)).to.have.property('length').greaterThan(10).lessThan(120)
  })
})
