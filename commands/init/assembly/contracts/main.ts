// The entry file of your WebAssembly module.
import { generateEvent, Args, toBytes } from "@massalabs/massa-as-sdk";

// This function is called when the contract is deployed.
export function constructor(args: StaticArray<u8>): StaticArray<u8> {
    let args_deserialized = new Args();
    let name = args_deserialized.nextString();
    generateEvent(`Constructor called with name ${name}`);
    return [];
}

export function event(_: StaticArray<u8>): StaticArray<u8> {
  const message = "I'm an event!";
  generateEvent(message);
  return toBytes(message);
}
