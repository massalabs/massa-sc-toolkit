export const exampleContract = `import { Address, generateEvent } from "@massalabs/massa-as-sdk";

import { setOf } from "@massalabs/massa-as-sdk/assembly/std/storage";

export function add(a: i32, b: i32): i32 {
    return a + b;
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
`;
