const fetch = window.fetch
const type = 'browser.mjs'
const native = true

const Headers = globalThis.Headers
const Response = globalThis.Response
const Request = globalThis.Request

export {
  fetch,
  type,
  Headers,
  Response,
  Request,
  native
}
