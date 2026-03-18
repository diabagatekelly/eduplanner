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
  TextEncoder: { value: TextEncoder },
  TextDecoder: { value: TextDecoder },
  ReadableStream: { value: ReadableStream },
  WritableStream: { value: WritableStream },
  TransformStream: { value: TransformStream },
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
