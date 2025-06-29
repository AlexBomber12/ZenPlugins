module.exports = {
  preset: 'ts-jest',
  collectCoverageFrom: [
    'src/plugins/fineco-it/**/*.ts'
  ],
  coveragePathIgnorePatterns: ['/windowLoader.js', '/src/plugins/fineco-it/index.ts'],
  coverageThreshold: {
    'src/plugins/fineco-it/': {
      lines: 90
    }
  },
  setupFiles: [],
  setupFilesAfterEnv: ['<rootDir>/scripts/setupJestTestFramework.js'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(j|t)s?(x)',
    '<rootDir>/src/**/?(*.)(spec|test).(j|t)s?(x)'
  ],
  testEnvironment: 'node',
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
    '^.+\\.xml$': '<rootDir>/scripts/jest-raw-loader',
    '^.+\\.html?$': '<rootDir>/scripts/jest-raw-loader'
  },
  moduleFileExtensions: ['js', 'ts']
}
