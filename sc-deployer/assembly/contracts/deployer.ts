import { generateEvent, createSC, getOpKeys, getOpData, call, functionExists, hasOpKey } from "@massalabs/massa-as-sdk";
import { Args } from '@massalabs/as-types'

export function main(_args: StaticArray<u8>): StaticArray<u8> {
    let masterKey = new StaticArray<u8>(1);
    masterKey[0] = 0x00;
    if (!hasOpKey(masterKey)) {
        return [];
    }
    let nbSCSer = getOpData(masterKey);
    let nbSC = new Args(nbSCSer).nextU64().unwrap();
    for (let i: u64 = 0; i < nbSC; i++) {
        let keyBase = new Args().add(i + 1);
        let key = keyBase.serialize();
        if (!hasOpKey(key)) {
            return [];
        }
        let SCBytecode = getOpData(key);
        const contractAddr = createSC(SCBytecode);
        if (functionExists(contractAddr, "constructor")) {
            let args_ident = new Uint8Array(1);
            args_ident[0] = 0x00;
            let keyArgs = keyBase.add(args_ident).serialize();
            let coins_ident = new Uint8Array(1);
            coins_ident[0] = 0x01;
            let keyCoins = keyBase.add(args_ident).serialize();
            let args: Args;
            if (hasOpKey(keyArgs)) {
                args = new Args(getOpData(keyArgs));
            } else {
                args = new Args();
            }
            let coins: u64;
            if (hasOpKey(keyCoins)) {
                coins = new Args(getOpData(keyCoins)).nextU64().unwrap();
            } else {
                coins = 0;
            }
            call(contractAddr, "constructor", args, coins);
        }
        generateEvent(`Contract deployed at address: ${contractAddr.toByteString()}`);
}
    return [];
}