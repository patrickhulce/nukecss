#!/usr/bin/env node

const fs = require('fs')
const nuke = require('../lib/nuke')
const html = '<div class="foo-bar" id="something"></div>'
const css = fs.readFileSync(__dirname + '/../test/fixtures/content.css', 'utf8')
const nuked = nuke(html, css)
console.log(nuked)
