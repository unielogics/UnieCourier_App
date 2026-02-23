/**
 * Copy Next.js static export (out/) into Capacitor webDir (www/).
 */
const fs = require('fs')
const path = require('path')

const outDir = path.join(__dirname, '..', 'out')
const wwwDir = path.join(__dirname, '..', 'www')

if (!fs.existsSync(outDir)) {
  console.error('Missing out/ directory. Run: npm run build')
  process.exit(1)
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name)
    const d = path.join(dest, e.name)
    if (e.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}

copyDir(outDir, wwwDir)
console.log('Copied out/ -> www/')
