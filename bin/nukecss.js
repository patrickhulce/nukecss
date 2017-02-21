#!/usr/bin/env node

const fs = require('fs')
const glob = require('glob')
const path = require('path')
const nuke = require('../lib/nuke')

const args = process.argv.slice(2)
if (args.length !== 2) {
  console.error(`
    Usage: nukecss <sources> <css>

    Example: nukecss 'src/**/*.+(js|html)' 'src/**/*.css' > dist/minified.css
  `.trim().replace(/\n +/, '\n'))
  process.exit(1)
}

const files = glob.sync(args[0]).map(file => {
  const extension = path.extname(file)
  const content = fs.readFileSync(file, 'utf8')
  return {extension, content}
})

glob.sync(args[1]).forEach(file => {
  const content = fs.readFileSync(file, 'utf8')
  const nuked = nuke(files, content)
  console.log(nuked)
})
