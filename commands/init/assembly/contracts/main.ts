// The entry file of your WebAssembly module.
import { generateEvent, toBytes } from '@massalabs/massa-as-sdk';

export function event(_: StaticArray<u8>): StaticArray<u8> {
  const message = "I'm an event!";
  generateEvent(message);
  return toBytes(message);
}
