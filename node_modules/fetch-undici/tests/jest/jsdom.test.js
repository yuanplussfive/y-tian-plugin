/* eslint-env jest */
/**
 * @jest-environment jsdom
 */

const process = require('process')
const semver = require('semver')
const { fetch, type, native } = require('fetch-undici')

test('jsdom in mjs', () => {
  expect(type).toBe('node.cjs')
  expect(fetch).toBeDefined()

  const supportsFetch = semver.satisfies(process.version, '>=18.0.0')
  if (supportsFetch) expect(native).toBe(true)
  else expect(native).toBe(false)
})
