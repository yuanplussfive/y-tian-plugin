import tap from 'tap'
import { join } from 'node:path'
import desm from 'desm'
import { JSDOM } from 'jsdom'
import tmp from 'p-temporary-directory'
import { writeFile } from 'node:fs/promises'
import { rollup } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'

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
  console.log(dir)
  const inpuOpts = {
    input: [join(__dirname, 'rollup-app.js')],
    plugins: [
      resolve({ browser: true }),
      commonjs()
    ]
  }

  const bundle = await rollup(inpuOpts)

  const outputOpts = {
    dir,
    format: 'es'
  }

  await bundle.write(outputOpts)

  await writeFile(join(dir, 'package.json'), '{ "type": "module" }')

  const { type, native } = await import(join(dir, 'rollup-app.js'))
  tap.equal(type, 'browser.mjs')
  tap.ok(native, 'native browser export in rollup')
  await cleanup()
})
