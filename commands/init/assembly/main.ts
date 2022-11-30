// The entry file of your WebAssembly module.
import { Address, Storage, generateEvent, toBytes } from "@massalabs/massa-as-sdk";

const testAddress = new Address("A12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR");

const keyTest = toBytes("test");
const valueTest = toBytes("value");

export function setStorage(_args: StaticArray<u8>): StaticArray<u8> {
    Storage.setOf(testAddress.toByteString(), keyTest, valueTest);
    return valueTest;
}

export function event(_: StaticArray<u8>): StaticArray<u8> {
    generateEvent("I'm an event ");
    return toBytes("1");
}
