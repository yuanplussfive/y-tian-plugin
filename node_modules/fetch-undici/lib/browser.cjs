module.exports = {
  fetch: window.fetch,
  Headers: globalThis.Headers,
  Response: globalThis.Response,
  Request: globalThis.Request,
  type: 'browser.cjs',
  native: true
}
