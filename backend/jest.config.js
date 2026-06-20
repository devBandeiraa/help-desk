/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  globalSetup: '<rootDir>/tests/globalSetup.ts',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json', isolatedModules: true }],
  },
  testTimeout: 30000,
  clearMocks: true,
}
