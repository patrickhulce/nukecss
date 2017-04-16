const SimpleSource = require('../../lib/sources/simple-source.js')
const HtmlSource = require('../../lib/sources/html-source.js')

describe('sources/html-source.js', () => {
  it('should return the type', () => {
    expect(HtmlSource.from('<html></html>')).to.have.property('type', 'html')
  })

  describe('#join', () => {
    it('should join to another HtmlSource', () => {
      const sourceA = HtmlSource.from('<html></html>')
      const sourceB = HtmlSource.from('<html></html>')
      expect(sourceA.join(sourceB)).to.have.property('type', 'html')
      expect(sourceB.join(sourceA)).to.have.property('type', 'html')
    })

    it('should not join to a malformed HtmlSource', () => {
      const sourceA = HtmlSource.from('<html></html>')
      const sourceB = HtmlSource.from('some<<invalid markup')
      expect(() => sourceA.join(sourceB)).to.throw()
      expect(() => sourceB.join(sourceA)).to.throw()
    })

    it('should not join to another non-HtmlSource', () => {
      const sourceA = HtmlSource.from('<html></html>')
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
                <div ng-class="{strike: deleted}" ng-repeat="value in obj">
                  {{template value}}
                </div>
              </div>
            </div>
            <script>
            const myJsVar = "my-javascript-class"
            </script>
          </body>
        </html>
      `

      const source = HtmlSource.from(html)

      it('should find tokens as elements', () => {
        expect(source).to.contain('div')
        expect(source).to.contain('h1')
        expect(source).to.contain('p')
        expect(source).to.contain('script')
      })

      it('should find tokens as classes', () => {
        expect(source).to.contain('container')
        expect(source).to.contain('ConTainer')
        expect(source).to.contain('lead')
        expect(source).to.contain('strike')
      })

      it('should find tokens as multiple classes', () => {
        expect(source).to.contain('several')
        expect(source).to.contain('classes')
        expect(source).to.contain('in-a-row')
      })

      it('should find tokens as identifiers', () => {
        expect(source).to.contain('my-hero-element')
      })

      it('should not find tokens as other attribtues', () => {
        expect(source).to.not.contain('stylesheet')
        expect(source).to.not.contain('text/javascript')
      })

      it('should not find tokens as text', () => {
        expect(source).to.not.contain('Header')
        expect(source).to.not.contain('examplelongtext')
      })

      it('should find tokens in script', () => {
        expect(source).to.contain('my-javascript-class')
        expect(source).to.not.contain('myJsVar')
      })
    })

    context('when options.strict=true', () => {
      const html = `
        <html>
        <div class="first-class second-class"></div>
        <script>const hello = 'my-class'</script>
        </html>
      `

      const source = HtmlSource.from(html, {strict: true})

      it('should find tokens as multiple classes', () => {
        expect(source).to.contain('first-class')
        expect(source).to.contain('second-class')
      })

      it('should find tokens in script', () => {
        expect(source).to.contain('my-class')
        expect(source).to.not.contain('my')
        expect(source).to.not.contain('hello')
      })
    })
  })
})
