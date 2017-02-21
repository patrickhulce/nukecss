# nukecss
[![NPM Package](https://badge.fury.io/js/nukecss.svg)](https://www.npmjs.com/package/nukecss)
[![Build Status](https://travis-ci.org/patrickhulce/nukecss.svg?branch=master)](https://travis-ci.org/patrickhulce/nukecss)
[![Coverage Status](https://coveralls.io/repos/github/patrickhulce/nukecss/badge.svg?branch=master)](https://coveralls.io/github/patrickhulce/nukecss?branch=master)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Dependencies](https://david-dm.org/patrickhulce/nukecss.svg)](https://david-dm.org/patrickhulce/nukecss)

Eliminates unused CSS rules. Built for single-page apps from the ground up. Inspired by [purifycss](https://github.com/purifycss/purifycss) and [uncss](https://github.com/giakki/uncss).

## How It Works
* Parses the CSS with [gonzales-pe](https://github.com/tonyganch/gonzales-pe) and walks the AST to find the IDs, classes, and DOM types used in selectors.
* Parses HTML and JavaScript sources to find rule usage in strings and attributes, falling back to simple RegExp search when parsing fails.
* Removes rules whose selectors cannot be found in the source set.

## Usage
`npm install --save nukecss`

```js
const nukecss = require('nukecss')

const javascript = 'const jsignored = "js-class other-class"'
const javascript2 = 'const woah = ["still", "works"].join("-")'
const html = '<div id="primary" class="html-class">html-ignored</div>'
const css = `
.jsignored { color: white; }
.html-ignored { color: white; }
.js-class { color: white; }
.other-class { color: white; }
.still-works { color: white; }
#primary { color: white; }
#primary > .unused { color: white; }
.also-unused { color: white; }
`

const nuked = nukecss([
  {content: javascript, type: 'js'},
  {content: javascript2, type: 'js'},
  {content: html, type: 'html'},
], css)
> console.log(nuked)
.js-class { color: white; }
.other-class { color: white; }
.still-works { color: white; }
#primary { color: white; }
```
