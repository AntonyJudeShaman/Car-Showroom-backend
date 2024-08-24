/** @type {import('jest').Config} */
const config = {
  clearMocks: true,

  collectCoverage: true,

  collectCoverageFrom: ['__tests__/**/*.js'],

  coverageDirectory: 'coverage',

  setupFiles: ['<rootDir>/jest.setup.js'],

  setupFilesAfterEnv: ['<rootDir>/__tests__/settings/setupTests.js'],
};

module.exports = config;
