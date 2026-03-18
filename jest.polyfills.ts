/**
 * MSW v2 requires Web API globals (Request, Response, etc.) that JSDOM doesn't provide.
 * This file runs as a Jest setupFile (before module loading) so globals exist
 * when MSW's modules are evaluated.
 *
 * @see https://mswjs.io/docs/faq#requestresponsetextencoder-is-not-defined-jest
 */
const { TextEncoder, TextDecoder } = require('node:util')
const { ReadableStream, WritableStream, TransformStream } = require('node:stream/web')

Object.defineProperties(globalThis, {
  TextEncoder: { value: TextEncoder, configurable: true, writable: true },
  TextDecoder: { value: TextDecoder, configurable: true, writable: true },
  ReadableStream: { value: ReadableStream, configurable: true, writable: true },
  WritableStream: { value: WritableStream, configurable: true, writable: true },
  TransformStream: { value: TransformStream, configurable: true, writable: true },
})

const undici = require('undici')

Object.defineProperties(globalThis, {
  Request: { value: undici.Request, configurable: true, writable: true },
  Response: { value: undici.Response, configurable: true, writable: true },
  Headers: { value: undici.Headers, configurable: true, writable: true },
  FormData: { value: undici.FormData, configurable: true },
  BroadcastChannel: {
    value:
      typeof BroadcastChannel !== 'undefined'
        ? BroadcastChannel
        : class BroadcastChannel {
            constructor() {}
            postMessage() {}
            close() {}
            addEventListener() {}
            removeEventListener() {}
          },
    configurable: true,
  },
})
