const native = globalThis?.fetch != null
exports.native = native

const fetchSource = native ? globalThis : require('undici')

exports.fetch = fetchSource?.fetch
exports.Headers = fetchSource?.Headers
exports.Response = fetchSource?.Response
exports.Request = fetchSource?.Request

exports.type = 'node.cjs'
