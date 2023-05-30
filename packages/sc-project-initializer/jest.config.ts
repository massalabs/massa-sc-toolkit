import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  roots: ['<rootDir>'],
  testMatch: ['**/test/*.spec.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'babel-jest'
  },
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(module-to-ignore)/)'
  ],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};

export default config;
