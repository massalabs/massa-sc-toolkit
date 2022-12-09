// The entry file of your WebAssembly module.
import {
  Address,
  Storage,
  generateEvent,
  Args,
  toBytes,
} from '@massalabs/massa-as-sdk';

const testAddress = new Address(
  'A12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR',
);

const keyTestArgs = new Args().add('test');
const valueTestArgs = new Args().add('value');

const keyTest = toBytes('test');
const valueTest = toBytes('value');

export function setStorageOf(_args: StaticArray<u8>): StaticArray<u8> {
  Storage.setOf(testAddress, keyTest, valueTest);
  return valueTest;
}

export function setStorageOfWithArgs(_args: StaticArray<u8>): StaticArray<u8> {
  Storage.setOf(testAddress, keyTestArgs, valueTestArgs);
  return valueTestArgs.serialize();
}

export function setStorage(_args: StaticArray<u8>): StaticArray<u8> {
  Storage.set(keyTest, valueTest);
  return valueTest;
}

export function event(_: StaticArray<u8>): StaticArray<u8> {
  generateEvent("I'm an event ");
  return [];
}
