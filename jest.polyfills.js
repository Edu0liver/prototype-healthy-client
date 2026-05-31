// Polyfills required by MSW v2 under jsdom. jsdom does not provide the Fetch
// API globals (fetch/Request/Response/Headers) nor the streaming/encoding
// primitives MSW relies on, so we pull them from Node's undici + core modules.
// Loaded via `setupFiles` so they exist before MSW is imported.
const { TextEncoder, TextDecoder } = require("node:util");
const {
  ReadableStream,
  TransformStream,
  WritableStream,
} = require("node:stream/web");
const {
  MessageChannel,
  MessagePort,
  BroadcastChannel,
} = require("node:worker_threads");
const { performance } = require("node:perf_hooks");

Object.defineProperties(globalThis, {
  TextEncoder: { value: TextEncoder, writable: true },
  TextDecoder: { value: TextDecoder, writable: true },
  ReadableStream: { value: ReadableStream, writable: true },
  TransformStream: { value: TransformStream, writable: true },
  WritableStream: { value: WritableStream, writable: true },
  // undici (loaded below) reads these at module-eval time; jsdom omits them.
  MessageChannel: { value: MessageChannel, writable: true },
  MessagePort: { value: MessagePort, writable: true },
  BroadcastChannel: { value: BroadcastChannel, writable: true },
  performance: { value: performance, writable: true, configurable: true },
});

const { fetch, Headers, FormData, Request, Response } = require("undici");

// configurable: true is required — @mswjs/interceptors redefines Request to
// record raw headers.
Object.defineProperties(globalThis, {
  fetch: { value: fetch, writable: true, configurable: true },
  Headers: { value: Headers, writable: true, configurable: true },
  FormData: { value: FormData, writable: true, configurable: true },
  Request: { value: Request, writable: true, configurable: true },
  Response: { value: Response, writable: true, configurable: true },
});
