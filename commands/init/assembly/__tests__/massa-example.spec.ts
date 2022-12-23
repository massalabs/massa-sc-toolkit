import { toBytes } from '@massalabs/massa-as-sdk';
import { event } from '../contracts/main';

describe('Group test', () => {
  test('Testing event', () => {
    expect(event([])).toStrictEqual(toBytes("I'm an event!"));
  });
});
