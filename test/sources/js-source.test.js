const SimpleSource = require('../../lib/sources/simple-source.js')
const JsSource = require('../../lib/sources/js-source.js')

describe('sources/js-source.js', () => {
  it('should return the type', () => {
    expect(JsSource.from('var x = 1')).to.have.property('type', 'js')
  })

  describe('#join', () => {
    it('should join to another JsSource', () => {
      const sourceA = JsSource.from('var x = "foo"')
      const sourceB = JsSource.from('var b = "bar"')
      expect(sourceA.join(sourceB)).to.have.property('type', 'js')
      expect(sourceB.join(sourceA)).to.have.property('type', 'js')
    })

    it('should not join to a malformed JsSource', () => {
      const sourceA = JsSource.from('var x = "foo')
      const sourceB = JsSource.from('var b = "bar"')
      expect(() => sourceA.join(sourceB)).to.throw()
      expect(() => sourceB.join(sourceA)).to.throw()
    })

    it('should not join to another non-JsSource', () => {
      const sourceA = JsSource.from('var x = "foo"')
      const sourceB = new SimpleSource('other content')
      expect(() => sourceA.join(sourceB)).to.throw()
      expect(() => sourceB.join(sourceA)).to.throw()
    })
  })

  describe('#contains', () => {
    context('when script is simple', () => {
      const script = `
        const myVar = 'the-class'
        const otherVar = 'the-other-class'
        const html = '<div class="inner-class">Content</div>'
        const dynamicVar = ['fa', 'icon'].join('-')
      `

      const source = JsSource.from(script)

      it('should find tokens as strings', () => {
        expect(source).to.contain('the-class')
        expect(source).to.contain('the-other-class')
        expect(source).to.contain('fa')
        expect(source).to.contain('tHe-cLaSs')
      })

      it('should find tokens within strings', () => {
        expect(source).to.contain('div')
        expect(source).to.contain('inner-class')
      })

      it('should find tokens as combinations of strings', () => {
        expect(source).to.contain('fa-icon')
      })

      it('should not find tokens as identifiers', () => {
        expect(source).to.not.contain('const')
        expect(source).to.not.contain('myVar')
        expect(source).to.not.contain('otherVar')
        expect(source).to.not.contain('dynamicVar')
      })
    })

    context('when script is malformed', () => {
      it('should not throw', () => {
        expect(() => JsSource.from('const foo != "whaaaa')).to.not.throw()
      })

      it('should fallback to SimpleSource', () => {
        const source = JsSource.from('const foo != "whaaa-is-going onhere')
        expect(source).to.have.property('type', 'simple')
        expect(source).to.contain('const')
        expect(source).to.contain('foo')
        expect(source).to.contain('whaaa-is-going')

        expect(source).to.contain('is')
        expect(source).to.not.contain('going on')
      })
    })

    context('when script is joined', () => {
      it('should find tokens stretching across both', () => {
        const sourceA = JsSource.from('var x = "foo"')
        const sourceB = JsSource.from('var b = "bar"; var c = "-"')
        const joined = sourceA.join(sourceB)
        expect(joined.contains('foo')).to.equal(true)
        expect(joined.contains('bar')).to.equal(true)
        expect(joined.contains('foo-bar')).to.equal(true)
      })
    })
  })
})
