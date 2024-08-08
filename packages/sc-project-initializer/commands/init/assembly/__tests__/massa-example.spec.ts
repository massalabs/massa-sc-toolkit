import { Args, stringToBytes } from '@massalabs/as-types';
import { constructor, hello, NAME_KEY } from '../contracts/main';
import { setDeployContext, Storage } from '@massalabs/massa-as-sdk';

const NAME = 'Massillian';

describe('SC unit tests', () => {
  beforeAll(() => {
    setDeployContext();
    const args = new Args().add(NAME).serialize();
    // init contract
    constructor(args);
  });

  test('name is set', () => {
    const name = Storage.get(NAME_KEY);
    expect(name).toBe(NAME);
  });

  test('say hello', () => {
    const expectedMessage = `Hello, ${NAME}!`;
    expect(hello([])).toStrictEqual(stringToBytes(expectedMessage));
  });
});
