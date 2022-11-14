
// The entry file of your WebAssembly module.
import { Address, Storage, generateEvent } from '@massalabs/massa-as-sdk';

const testAddress = new Address(
	"A12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR"
);

export function setStorage(): void {
	Storage.setOf(testAddress, "test", "value");
}

export function event(): void {
	generateEvent("I'm an event ");
}
