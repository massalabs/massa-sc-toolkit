// The entry file of your WebAssembly module.
import {
  callerHasWriteAccess,
  generateEvent,
  toBytes,
} from '@massalabs/massa-as-sdk';
import { Args } from '@massalabs/as-types';

// This function is called when the contract is deployed.
export function constructor(args: StaticArray<u8>): StaticArray<u8> {
  // This line is important. It ensure that this function can't be called in the future.
  // If you remove this check someone could call your constructor function and reset your SC.
  if (!callerHasWriteAccess) {
    return [];
  }
  const argsDeser = new Args(args);
  const name = argsDeser.nextString().unwrap();
  generateEvent(`Constructor called with name ${name}`);
  return [];
}

export function event(_: StaticArray<u8>): StaticArray<u8> {
  const message = "I'm an event!";
  generateEvent(message);
  return toBytes(message);
}
