const config = require('../support/jest/jest.config');
const { jestSupportDir } = require('../support/jest/helpers');
const { server: __SERVER__ } = require('./server.config');

const {
  clearMocks,
  verbose,
  moduleFileExtensions,
  globals,
  transform,
  testPathIgnorePatterns,
  cacheDirectory,
  moduleNameMapper,
} = config;

module.exports = {
  clearMocks,
  verbose,
  moduleFileExtensions,
  globals: {
    ...globals,
    __E2E__: true,
    __SERVER__,
  },
  transform,
  testPathIgnorePatterns,
  testRegex: __SERVER__.regex,
  cacheDirectory,
  moduleNameMapper,
  modulePathIgnorePatterns: ['node_modules'],
  preset: 'jest-puppeteer',
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  setupFilesAfterEnv: [
    'expect-puppeteer',
    jestSupportDir('jest.framework.ts'),
    '<rootDir>/jest-setup.ts',
  ],
  globalSetup: './jest.puppeteer.setup.ts',
  globalTeardown: './jest.puppeteer.teardown.ts',
  testEnvironment: './custom-environment.js',
  testRunner: 'jest-circus/runner',
};
