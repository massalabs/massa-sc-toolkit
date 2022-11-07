
// The entry file of your WebAssembly module.
import { Address, Storage, generateEvent } from '@massalabs/massa-as-sdk';
import { setOf } from "@massalabs/massa-as-sdk/assembly/std/storage";

export function addStorage(): void {
	Storage.set('key', 'value');
	generateEvent("I'm a test");
}

const testAddress = new Address(
	"A12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR"
);

export function setStorage(): void {
	setOf(testAddress, "test", "value");
}

export function event(): void {
	generateEvent("I'm an event ");
}
