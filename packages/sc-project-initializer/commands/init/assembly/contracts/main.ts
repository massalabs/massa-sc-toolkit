// The entry file of your WebAssembly module.
import { Context, generateEvent, Storage } from '@massalabs/massa-as-sdk';
import { Args, stringToBytes } from '@massalabs/as-types';

export const NAME_KEY = 'name_key';

/**
 * This function is meant to be called only one time: when the contract is deployed.
 *
 * @param binaryArgs - Arguments serialized with Args
 */
export function constructor(binaryArgs: StaticArray<u8>): void {
  // This line is important. It ensures that this function can't be called in the future.
  // If you remove this check, someone could call your constructor function and reset your smart contract.
  assert(Context.isDeployingContract());

  const argsDeser = new Args(binaryArgs);
  const name = argsDeser
    .nextString()
    .expect('Name argument is missing or invalid');

  Storage.set(NAME_KEY, name);
  generateEvent(`Constructor called with name ${name}`);
}

/**
 * @param _ - not used
 * @returns the emitted event serialized in bytes
 */
export function hello(_: StaticArray<u8>): StaticArray<u8> {
  assert(Storage.has(NAME_KEY), 'Name is not set');
  const name = Storage.get(NAME_KEY);
  const message = `Hello, ${name}!`;
  generateEvent(message);
  return stringToBytes(message);
}
