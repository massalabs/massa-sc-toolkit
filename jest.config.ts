module.exports = {
  roots: ['<rootDir>/test/'],
  testMatch: ['*/.spec.ts'],
  transform: {
    '^.+.(ts|tsx)$': 'ts-jest',
  },
};
