#!/usr/bin/env node

const fs = require('fs')
const prune = require('../lib/prune')
const html = '<div class="foo-bar" id="something"></div>'
const css = fs.readFileSync(__dirname + '/../test/fixtures/content.css', 'utf8')
const pruned = prune(html, css)
console.log(pruned)
