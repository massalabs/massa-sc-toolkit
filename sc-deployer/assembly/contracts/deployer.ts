import { generateEvent, createSC, getOpKeys, getOpData, call, Args, functionExists, hasOpKey } from "@massalabs/massa-as-sdk";

export function main(_args: StaticArray<u8>): StaticArray<u8> {
    const keys = getOpKeys();
    let master_key = new StaticArray<u8>(1);
    master_key[0] = 0x00;
    if (!hasOpKey(master_key)) {
        generateEvent("You need to fill the key [0] with the number of SC to deploy");
        return [];
    }
    generateEvent(`1: Deploying ${keys.length - 1} SC`);
    let nb_sc_ser = getOpData(master_key);
    let nb_sc = new Args(nb_sc_ser).nextU64();
    generateEvent(`2: Deploying ${nb_sc} SC`);
    for (let i: u64 = 0; i < nb_sc; i++) {
        let key = new Args().add(i).serialize();
        if (!hasOpKey(key)) {
            generateEvent(`You need to fill the key [${i + 1}] with the bytecode of the SC`);
            return [];
        }
        let sc_bytecode = getOpData(key);
        const contractAddr = createSC(sc_bytecode);
        let msg: string;
        if (contractAddr.isValid()) {
            msg = "Contract deployed at address:";
        } else {
            msg = "createSC returned an invalid address:";
        }
        if (functionExists(contractAddr, "constructor")) {
            let key_args = new StaticArray<u8>(key.length);
            // copy key in key_args
            let j = 0;
            for (; j < key.length; j++) {
                key_args[j] = key[j];
            }
            key_args[j] = 0x00;
            let key_coins = new StaticArray<u8>(key.length);
            // copy key in key_coins
            let k = 0;
            for (; k < key.length; k++) {
                key_coins[k] = key[k];
            }
            key_coins[k] = 0x01;
            let args: Args;
            if (hasOpKey(key_args)) {
                args = new Args(getOpData(key_args));
            } else {
                args = new Args();
            }
            let coins: u64;
            if (hasOpKey(key_coins)) {
                coins = new Args(getOpData(key_coins)).nextU64();
            } else {
                coins = 0;
            }
            call(contractAddr, "constructor", args, coins);
        }
        generateEvent(`${msg} ${contractAddr.toByteString()}`);
}
    return [];
}