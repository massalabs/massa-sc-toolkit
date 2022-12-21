import { generateEvent, createSC, getOpKeys, getOpData, call, Args, functionExists, hasOpKey } from "@massalabs/massa-as-sdk";

export function deploy(_args: StaticArray<u8>): StaticArray<u8> {
    const keys = getOpKeys();
    let master_key = new StaticArray<u8>(1);
    master_key[0] = 0x00;
    if (!hasOpKey(master_key)) {
        generateEvent("You need to fill the key [0] with the number of SC to deploy");
        return [];
    }
    let nb_sc_ser = getOpData(master_key);
    let nb_sc = new Args(nb_sc_ser).nextU64();
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
            call(contractAddr, "constructor", new Args(getOpData(key_args)), 0);
        }
        generateEvent(`${msg} ${contractAddr.toByteString()}`);
}
    return [];
}