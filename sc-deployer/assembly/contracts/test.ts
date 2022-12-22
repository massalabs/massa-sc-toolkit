import { Args, generateEvent } from "@massalabs/massa-as-sdk";

export function main(args: StaticArray<u8>): StaticArray<u8> {
    let args_ser = new Args(args);
    generateEvent(`Hello ${args_ser.nextString()}`);
    return [];
}