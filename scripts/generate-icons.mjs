import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const iconsDir = join(publicDir, 'icons')
mkdirSync(iconsDir, { recursive: true })

const TERRACOTTA = '#E0704F'
const CREAM = '#FFF9F2'

function glyph({ scale = 1, cx = 256, cy = 256 } = {}) {
  // house silhouette: rounded roof + base + couple window, centered at (cx, cy)
  const s = scale
  const t = (x, y) => `${cx + (x - 256) * s},${cy + (y - 256) * s}`
  const sw = 30 * s
  return `
    <polygon points="${t(256, 108)} ${t(132, 236)} ${t(380, 236)}"
      fill="${CREAM}" stroke="${CREAM}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" />
    <rect x="${cx - 106 * s}" y="${cy - 20 * s}" width="${212 * s}" height="${160 * s}" rx="${26 * s}" fill="${CREAM}" />
    <circle cx="${cx}" cy="${cy + 62 * s}" r="${36 * s}" fill="${TERRACOTTA}" />
    <circle cx="${cx - 12 * s}" cy="${cy + 62 * s}" r="${6.5 * s}" fill="${CREAM}" />
    <circle cx="${cx + 12 * s}" cy="${cy + 62 * s}" r="${6.5 * s}" fill="${CREAM}" />
  `
}

function svgAny() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="115" fill="${TERRACOTTA}" />
    ${glyph({ scale: 1 })}
  </svg>`
}

function svgMaskable() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="${TERRACOTTA}" />
    ${glyph({ scale: 0.72 })}
  </svg>`
}

function svgFavicon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="140" fill="${TERRACOTTA}" />
    ${glyph({ scale: 1.06 })}
  </svg>`
}

const anySvg = svgAny()
const maskableSvg = svgMaskable()
const faviconSvg = svgFavicon()

writeFileSync(join(publicDir, 'favicon.svg'), faviconSvg)

const jobs = [
  { svg: anySvg, out: join(iconsDir, 'icon-192.png'), size: 192 },
  { svg: anySvg, out: join(iconsDir, 'icon-512.png'), size: 512 },
  { svg: maskableSvg, out: join(iconsDir, 'icon-maskable-192.png'), size: 192 },
  { svg: maskableSvg, out: join(iconsDir, 'icon-maskable-512.png'), size: 512 },
  { svg: anySvg, out: join(publicDir, 'apple-touch-icon.png'), size: 180 },
]

await Promise.all(
  jobs.map(({ svg, out, size }) =>
    sharp(Buffer.from(svg)).resize(size, size).png().toFile(out)
  )
)

console.log('Icons generated.')
