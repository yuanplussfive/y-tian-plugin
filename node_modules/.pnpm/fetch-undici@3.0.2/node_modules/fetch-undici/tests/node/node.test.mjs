import tap from 'tap'
import process from 'process'
import semver from 'semver'
import { type, fetch, native } from 'fetch-undici'

tap.test('node esm gets undici cjs', async t => {
  t.equal(type, 'node.cjs')
  t.ok(fetch)

  const supportsFetch = semver.satisfies(process.version, '>=18.0.0')
  if (supportsFetch) t.ok(native, 'exported native fetch in node versions >=18')
  else t.false(native, 'exported undici fetch in node versions <18')
})
