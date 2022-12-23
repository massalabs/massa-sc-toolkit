import { generateEvent } from "@massalabs/massa-as-sdk";
import { Args } from '@massalabs/as-types'

export function constructor(args: StaticArray<u8>): StaticArray<u8> {
    let argsSer = new Args(args);
    generateEvent(`Hello ${argsSer.nextString().unwrap()}`);
    return [];
}