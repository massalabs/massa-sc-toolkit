import { getOpData, generateEvent, createSC } from "@massalabs/massa-as-sdk"

export function main(_: StaticArray<u8>): StaticArray<u8> {
    let key = new StaticArray<u8>(1);
    key[0] = 0xFF;
    let sc_bytecode = getOpData(key);
    generateEvent(`Deployer at: ${createSC(sc_bytecode).toByteString()}`);
    return [];
}

