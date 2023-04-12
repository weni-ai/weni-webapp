const path = require('path');

module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  rootDir: path.resolve(__dirname),
  collectCoverage: true,
  coverageReporters: ['text', 'text-summary'],
  // coverageReporters: [],
  coverageDirectory: '<rootDir>/tests/unit/coverage',
  // setupFiles: ['<rootDir>/tests/unit/setup.js'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/tests/unit/__mocks__/fileMock.js',
  },
  collectCoverageFrom: [
    'src/**/*.js',
    'src/**/*.vue',
    '!**/AccountInitOptions.js',
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
