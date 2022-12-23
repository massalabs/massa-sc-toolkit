import { generateEvent, createSC, getOpKeys, getOpData, call, Args, functionExists, hasOpKey } from "@massalabs/massa-as-sdk";

export function main(_args: StaticArray<u8>): StaticArray<u8> {
    const keys = getOpKeys();
    let master_key = new StaticArray<u8>(1);
    master_key[0] = 0x00;
    if (!hasOpKey(master_key)) {
        return [];
    }
    let nb_sc_ser = getOpData(master_key);
    let nb_sc = new Args(nb_sc_ser).nextU64();
    for (let i: u64 = 0; i < nb_sc; i++) {
        let key_base = new Args().add(i + 1);
        let key = key_base.serialize();
        if (!hasOpKey(key)) {
            return [];
        }
        let sc_bytecode = getOpData(key);
        const contractAddr = createSC(sc_bytecode);
        if (functionExists(contractAddr, "constructor")) {
            let args_ident = new Uint8Array(1);
            args_ident[0] = 0x00;
            let key_args = key_base.add(args_ident).serialize();
            let coins_ident = new Uint8Array(1);
            coins_ident[0] = 0x01;
            let key_coins = key_base.add(args_ident).serialize();
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
        generateEvent(`Contract deployed at address: ${contractAddr.toByteString()}`);
}
    return [];
}