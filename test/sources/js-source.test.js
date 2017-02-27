const Source = require('../../lib/sources/source.js')
const JsSource = require('../../lib/sources/js-source.js')

describe('sources/js-source.js', () => {
  it('should return the type', () => {
    expect(new JsSource('var x = 1')).to.have.property('type', 'js')
  })

  describe('#join', () => {
    it('should join to another JsSource', () => {
      const sourceA = new JsSource('var x = "foo"')
      const sourceB = new JsSource('var b = "bar"')
      expect(sourceA.join(sourceB)).to.have.property('type', 'js')
      expect(sourceB.join(sourceA)).to.have.property('type', 'js')
    })

    it('should join to a malformed JsSource', () => {
      const sourceA = new JsSource('var x = "foo')
      const sourceB = new JsSource('var b = "bar"')
      expect(sourceA.join(sourceB)).to.have.property('type', 'js')
      expect(sourceB.join(sourceA)).to.have.property('type', 'js')
    })

    it('should not join to another non-JsSource', () => {
      const sourceA = new JsSource('var x = "foo"')
      const sourceB = new Source('other content')
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

      const source = new JsSource(script)

      it('should find tokens as strings', () => {
        expect(source.contains('the-class')).to.equal(true)
        expect(source.contains('the-other-class')).to.equal(true)
        expect(source.contains('fa')).to.equal(true)
      })

      it('should find tokens within strings', () => {
        expect(source.contains('div')).to.equal(true)
        expect(source.contains('inner-class')).to.equal(true)
      })

      it('should find tokens as combinations of strings', () => {
        expect(source.contains('fa-icon')).to.equal(true)
      })

      it('should not find tokens as identifiers', () => {
        expect(source.contains('const')).to.equal(false)
        expect(source.contains('myVar')).to.equal(false)
        expect(source.contains('otherVar')).to.equal(false)
        expect(source.contains('dynamicVar')).to.equal(false)
      })
    })

    context('when script is malformed', () => {
      it('should not throw', () => {
        expect(() => new JsSource('const foo != "whaaaa')).to.not.throw()
      })

      it('should fallback to regex search', () => {
        const source = new JsSource('const foo != "whaaa-is-going onhere')
        expect(source.contains('const')).to.equal(true)
        expect(source.contains('foo')).to.equal(true)
        expect(source.contains('whaaa-is-going')).to.equal(true)

        expect(source.contains('is')).to.equal(true)
        expect(source.contains('going on')).to.equal(false)
      })
    })

    context('when script is joined', () => {
      it('should find tokens stretching across both', () => {
        const sourceA = new JsSource('var x = "foo"')
        const sourceB = new JsSource('var b = "bar"; var c = "-"')
        const joined = sourceA.join(sourceB)
        expect(joined.contains('foo')).to.equal(true)
        expect(joined.contains('bar')).to.equal(true)
        expect(joined.contains('foo-bar')).to.equal(true)
      })
    })
  })
})
