import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/specs/**',
    '!auth.ts',
    '!middleware.ts',
    '!app/api/auth/**',
    '!hooks/**',
    '!lib/query-keys.ts',
  ],
  coverageThreshold: {
    global: {
      // branches at 98: Jest 30's coverage engine counts implicit else branches in else-if chains
      branches: 98,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  coverageDirectory: '../coverage',
  rootDir: 'src/',
  // Note: rootDir is 'src/', so '../' resolves to repo root (same pattern as setupFilesAfterEnv)
  setupFiles: ['../jest.polyfills.ts'],
  setupFilesAfterEnv: ['../jest.setup.ts'],
  testEnvironment: 'jsdom',
}

const jestConfig = createJestConfig(config)

// Override transformIgnorePatterns to allow next-auth and its ESM dependencies to be transformed
export default async (...args: any[]) => {
  const resolvedConfig = await (jestConfig as any)(...args)
  return {
    ...resolvedConfig,
    transformIgnorePatterns: [
      // until-async is a real MSW dependency (@mswjs/interceptors uses it)
      '/node_modules/(?!(next-auth|@auth|@panva|jose|openid-client|oauth4webapi|msw|@mswjs|until-async)/).*',
      '\\.pnp\\.[^\\/]+$',
    ],
  }
}
