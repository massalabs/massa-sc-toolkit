import {
  event,
  setStorage,
  setStorageOf,
  setStorageOfWithArgs,
} from '../contracts/main';
import {
  Address,
  Context,
  fromBytes,
  Storage,
  toBytes,
  Args,
} from '@massalabs/massa-as-sdk';

describe('An other group of test', () => {
  test('Testing the callstack', () => {
    const callStack = Context.addressStack();
    expect(callStack[0].toByteString()).toBe(
      'A12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
    );
    expect(callStack[1].toByteString()).toBe(
      'A12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT',
    );
  });

  test('Testing the Storage setOf', () => {
    setStorageOf([]);
    expect(
      fromBytes(
        Storage.getOf(
          new Address('A12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR'),
          toBytes('test'),
        ),
      ),
    ).toBe('value');
  });

  test('Testing the Storage setOf with Args', () => {
    setStorageOfWithArgs([]);
    expect(
      Storage.getOf(
        new Address('A12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR'),
        new Args().add('test'),
      ).nextString(),
    ).toBe('value');
  });

  test('Testing the Storage set', () => {
    setStorage([]);
    expect(fromBytes(Storage.get(toBytes('test')))).toBe('value');
  });

  test('Testing the Storage set', () => {
    setStorage([]);
    expect(Storage.has(toBytes('test'))).toBe(true);
  });

  test('Testing the Storage set', () => {
    setStorage([]);
    expect(
      Storage.hasOf(
        new Address('A12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR'),
        toBytes('test'),
      ),
    ).toBe(true);
  });

  test('Testing event', () => {
    event([]);
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
