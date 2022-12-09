import { event, setStorage } from '../contracts/main';
import { Address, Storage, toBytes } from '@massalabs/massa-as-sdk';

describe('A group of test', () => {
  test('A test throwing an error', () => {
    event(new StaticArray<u8>(0));
    const got = 42;
    const want = 41;
    expect(got).toBe(want);
  });
});

describe('An other group of test', () => {
  test('Testing the Storage', () => {
    setStorage(new StaticArray<u8>(0));
    assert(
      Storage.getOf(
        new Address('A12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR'),
        toBytes('test'),
      ) == toBytes('value'),
      'Test failed',
    );
  });
});

describe('Test Table tests', () => {
  // prettier-ignore
  checksForEachLineThatThe('sum of two integers', 'arg0 + arg1', is, 'arg3', [
    1, 2, 3,
    3, 4, 7,
    4, 5, 9,
  ]);

  // prettier-ignore
  checksForEachLineThatThe('`greater than` of two integers', 'arg0 > arg1', isFalse, [
    0, 1,
    2, 3,
  ]);
});
