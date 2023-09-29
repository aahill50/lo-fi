// https://github.com/microsoft/TypeScript/issues/29867#issue-409042611
interface ReadableStream<R = unknown> {
    [Symbol.asyncIterator](): AsyncIterator<R>;
  }