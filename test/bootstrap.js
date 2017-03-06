const chai = require('chai')
chai.use(require('sinon-chai'))

chai.use(function () {
  chai.Assertion.overwriteChainableMethod('contain', function (_super) {
    return function (value, msg) {
      const obj = this._obj
      if (obj && typeof obj.contains === 'function') {
        this.assert(
          obj.contains(value),
          `expected ${obj.constructor.name} to contain #{exp}`,
          `expected ${obj.constructor.name} to not contain #{exp}`,
          value,
          null
        )
      } else {
        _super.call(this, value, msg)
      }
    }
  }, _super => _super)
})

global.expect = chai.expect
