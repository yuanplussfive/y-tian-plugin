const tap = require('tap')
const process = require('process')
const semver = require('semver')
const { type, fetch, native } = require('fetch-undici')

tap.test('node gets undici cjs', async t => {
  t.equal(type, 'node.cjs')
  t.ok(fetch)

  const supportsFetch = semver.satisfies(process.version, '>=18.0.0')
  if (supportsFetch) t.ok(native, 'exported native fetch in node versions >=18')
  else t.false(native, 'exported undici fetch in node versions <18')
})
