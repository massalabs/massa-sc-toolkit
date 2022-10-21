
// The entry file of your WebAssembly module.
import { Storage, generateEvent } from '@massalabs/massa-as-sdk';

export function addStorage(): void {
	Storage.set('key', 'value');
	generateEvent("I'm a test");
}
