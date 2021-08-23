const path = require('path');

module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  rootDir: path.resolve(__dirname),
  collectCoverage: true,
  coverageReporters: ['text', 'text-summary'],
  // coverageReporters: [],
  coverageDirectory: '<rootDir>/tests/unit/coverage',
  setupFiles: ['<rootDir>/tests/unit/setup'],
  collectCoverageFrom: [
    'src/**/*.js',
    'src/**/*.vue',
    '!src/main.js',
    '!src/App.vue',
    '!src/api/**',
    '!src/components-v1/**',
    '!src/router/**',
    '!**/node_modules/**',
    '!tests/**',
    '!src/store/**',
  ],
};
