import { describe, expect, log, run, test } from 'as-test';
import { stringToBytes } from '@massalabs/as-types';
import { event } from '../contracts/main';

describe('Group test', () => {
  test('Testing event', () => {
    expect(event([])).toBe(stringToBytes("I'm an event!"));
    log('Log test  😉 😉 😉');
  });
});

run({
  log: true,
});
