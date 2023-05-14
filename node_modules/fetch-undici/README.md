# fetch-undici
[![Actions Status](https://github.com/bcomnes/fetch-undici/workflows/tests/badge.svg)](https://github.com/bcomnes/fetch-undici/actions)

Isomorphic exports of `fetch`, providing [`window.fetch`][br] in the browser, and [`undici.fetch`][ud] in node.js.

```
npm install fetch-undici
```

## Usage


``` js
import {
  fetch,
  Headers,
  Response,
  Request
} from 'fetch-undici';
```

## Why

If you want to write an API client of some kind, that would be useful in the browser or in Node.js, `fetch-undici` provides the best implementation of `fetch` for the environment it's used in.

## How

`fetch-undici` works by utilizing environment specific exports fields so that you can have dependency injection at the built-in node module resolver layer.
It supports the following export fields:

- `main` (cjs node)
- `browser` (cjs browser)
- `exports.node` (cjs node)
- `exports.browser` (esm browser)

## License

MIT

[br]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[ud]: https://github.com/nodejs/undici
