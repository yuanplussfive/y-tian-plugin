import tap from 'tap'
import esbuild from 'esbuild'
import { join } from 'node:path'
import desm from 'desm'
import { JSDOM } from 'jsdom'
import tmp from 'p-temporary-directory'
import { writeFile } from 'node:fs/promises'

const { window } = new JSDOM('', {
  url: 'https://example.org/',
  referrer: 'https://example.com/',
  contentType: 'text/html',
  includeNodeLocations: true,
  storageQuota: 10000000
})

global.window = window

const __dirname = desm(import.meta.url)

tap.test('test build with esbuild', async t => {
  const [dir, cleanup] = await tmp()

  const results = await esbuild.build({
    entryPoints: [join(__dirname, 'esbuild-app.js')],
    bundle: true,
    write: true,
    format: 'esm',
    splitting: true,
    sourcemap: true,
    outdir: join(dir),
    target: ['es2020']
  })

  tap.equal(results.errors.length, 0)

  await writeFile(join(dir, 'package.json'), '{ "type": "module" }')

  const { type, native } = await import(join(dir, 'esbuild-app.js'))
  tap.equal(type, 'browser.mjs')
  tap.equal(native, true)
  await cleanup()
})
