module.exports = {
  // Test environment setup
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/__tests__/**/*.js'
  ],
  
  // Transform configuration
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  
  // Coverage settings
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Line ending handling
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  
  // Additional settings
  verbose: true,
  testTimeout: 30000,
  
  // Handle Windows line endings
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/tests.disabled/'],
  
  // Setup files
  setupFilesAfterEnv: ['./jest.setup.js'],
  
  // Mocks path
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Error handling
  bail: 0,
  
  // Improve test output
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './reports',
        outputName: 'jest-junit.xml'
      }
    ]
  ]
};
