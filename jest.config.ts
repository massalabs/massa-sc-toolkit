module.exports = {
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+.(ts|tsx)$': 'ts-jest',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/packages/.*/dist/',
    '/assembly/',
  ],
};
