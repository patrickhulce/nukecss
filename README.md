# nukecss
[![NPM Package](https://badge.fury.io/js/nukecss.svg)](https://www.npmjs.com/package/nukecss)
[![Build Status](https://travis-ci.org/patrickhulce/nukecss.svg?branch=master)](https://travis-ci.org/patrickhulce/nukecss)
[![Coverage Status](https://coveralls.io/repos/github/patrickhulce/nukecss/badge.svg?branch=master)](https://coveralls.io/github/patrickhulce/nukecss?branch=master)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Dependencies](https://david-dm.org/patrickhulce/nukecss.svg)](https://david-dm.org/patrickhulce/nukecss)

Eliminates unused CSS rules. Built from the ground up for single-page apps. Inspired by [purifycss](https://github.com/purifycss/purifycss) and [uncss](https://github.com/giakki/uncss).

## How It Works
* Parses the CSS with [postcss](https://github.com/postcss/postcss) and [gonzales-pe](https://github.com/tonyganch/gonzales-pe) and walks the AST to find the IDs, classes, and DOM types used in selectors.
* Parses HTML and JavaScript sources to find rule usage in strings and attributes, falling back to simple RegExp search when parsing fails.
* Removes rules whose selectors cannot be found in the source set.

## Usage
`npm install --save nukecss`

#### nuke.js
```js
const fs = require('fs')
const nukecss = require('nukecss')
const css = fs.readFileSync('myfile.css')

nukecss('./**/*.@(js|html)', css)
// .js-class { color: white; }
// .other-class { color: white; }
// .still-works { color: white; }
// #primary { color: white; }
```

#### myfile.js
```js
const jsignored = "js-class other-class"
const woah = ["still", "works"].join("-")
```

#### myfile.css
```css
.jsignored { color: white; }
.html-ignored { color: white; }
.js-class { color: white; }
.other-class { color: white; }
.still-works { color: white; }
#primary { color: white; }
#primary > .unused { color: white; }
.also-unused { color: white; }
```

#### myfile.html
```html
<html>
<body>
  <div id="primary" class="html-class">html-ignored</div>
</body>
</html>
```
