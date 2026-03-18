import { server } from './src/specs/msw/server'

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
