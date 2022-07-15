module.exports = {
  testIgnorePatterns: ["/node_modules", '/.next/'],
  setupFilesBeforeEnv: [
    "<rootDir>/src/tests/setupTests.ts"
  ],
  trasnform: {
    "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/node_modules/babel-jest"
  },
  testEnvironment: 'jsdom',
}