// The entry file of your WebAssembly module.
import { generateEvent, toBytes } from '@massalabs/massa-as-sdk';
import {Args} from '@massalabs/as-types'

// This function is called when the contract is deployed.
export function constructor(args: StaticArray<u8>): StaticArray<u8> {
  const args_deserialized = new Args(args);
  const name = args_deserialized.nextString().unwrap();
  generateEvent(`Constructor called with name ${name}`);
  return [];
}

export function event(_: StaticArray<u8>): StaticArray<u8> {
  const message = "I'm an event!";
  generateEvent(message);
  return toBytes(message);
}
