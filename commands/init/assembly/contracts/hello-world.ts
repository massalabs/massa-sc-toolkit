import { generateEvent } from "@massalabs/massa-as-sdk";

export function main(_: StaticArray<u8>): StaticArray<u8> {
    generateEvent("hello world");
    return [];
}
