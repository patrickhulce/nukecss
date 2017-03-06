const SimpleSource = require('../../lib/sources/simple-source.js')
const HtmlSource = require('../../lib/sources/html-source.js')

describe('sources/html-source.js', () => {
  it('should return the type', () => {
    expect(new HtmlSource('<html></html>')).to.have.property('type', 'html')
  })

  describe('#join', () => {
    it('should join to another HtmlSource', () => {
      const sourceA = new HtmlSource('<html></html>')
      const sourceB = new HtmlSource('<html></html>')
      expect(sourceA.join(sourceB)).to.have.property('type', 'html')
      expect(sourceB.join(sourceA)).to.have.property('type', 'html')
    })

    it('should join to a malformed HtmlSource', () => {
      const sourceA = new HtmlSource('<html></html>')
      const sourceB = new HtmlSource('<html')
      expect(sourceA.join(sourceB)).to.have.property('type', 'html')
      expect(sourceB.join(sourceA)).to.have.property('type', 'html')
    })

    it('should not join to another non-HtmlSource', () => {
      const sourceA = new HtmlSource('<html></html>')
      const sourceB = new SimpleSource('other content')
      expect(() => sourceA.join(sourceB)).to.throw()
      expect(() => sourceB.join(sourceA)).to.throw()
    })
  })

  describe('#contains', () => {
    context('when html is simple', () => {
      const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <title>Basic HTML Example</title>
            <link href="app.css" rel="stylesheet">
            <script src="app.js" type="text/javascript"></script>
          </head>
          <body>
            <div id="my-hero-element" class="container">
              <div class="several classes in-a-row">
                <h1>My Header</h1>
                <p class="lead">Examplelongtext</p>
              </div>
            </div>
            <script>
            const myJsVar = "my-javascript-class"
            </script>
          </body>
        </html>
      `

      const source = new HtmlSource(html)

      it('should find tokens as elements', () => {
        expect(source.contains('div')).to.equal(true)
        expect(source.contains('h1')).to.equal(true)
        expect(source.contains('p')).to.equal(true)
        expect(source.contains('script')).to.equal(true)
      })

      it('should find tokens as classes', () => {
        expect(source.contains('container')).to.equal(true)
        expect(source.contains('lead')).to.equal(true)
      })

      it('should find tokens as multiple classes', () => {
        expect(source.contains('several')).to.equal(true)
        expect(source.contains('classes')).to.equal(true)
        expect(source.contains('in-a-row')).to.equal(true)
      })

      it('should find tokens as identifiers', () => {
        expect(source.contains('my-hero-element')).to.equal(true)
      })

      it('should not find tokens as other attribtues', () => {
        expect(source.contains('stylesheet')).to.equal(false)
        expect(source.contains('javascript')).to.equal(false)
      })

      it('should not find tokens as text', () => {
        expect(source.contains('Header')).to.equal(false)
        expect(source.contains('examplelongtext')).to.equal(false)
      })
    })
  })
})
