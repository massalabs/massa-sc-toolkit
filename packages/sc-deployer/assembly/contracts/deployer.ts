import {
  generateEvent,
  createSC,
  getOpData,
  call,
  functionExists,
  hasOpKey,
} from '@massalabs/massa-as-sdk';
import { Args, stringToBytes } from '@massalabs/as-types';
import { setOf } from '@massalabs/massa-as-sdk/assembly/std/storage';

const CONSTRUCTOR = 'constructor';

/**
 * This function deploys and calls the constructor function of the deployed smart contract.
 *
 * The data structure of the operation datastore must be like describe in
 * packages/sc-deployer/src/index.ts
 *
 * @param _ - not used
 */
export function main(_: StaticArray<u8>): StaticArray<u8> {
  let masterKey = new StaticArray<u8>(1);
  masterKey[0] = 0x00;
  let protoKey = new StaticArray<u8>(1);
  protoKey[0] = 0x02;
  if (!hasOpKey(masterKey)) {
    return [];
  }
  let nbSCSer = getOpData(masterKey);
  let nbSC = new Args(nbSCSer).nextU64().unwrap();
  for (let i: u64 = 0; i < nbSC; i++) {
    let keyBaseArgs = new Args().add(i + 1);
    let keyBaseCoins = new Args().add(i + 1);
    let key = keyBaseArgs.serialize();
    if (!hasOpKey(key)) {
      return [];
    }
    let SCBytecode = getOpData(key);
    const contractAddr = createSC(SCBytecode);
    if (hasOpKey(protoKey)) {
      let protos = getOpData(protoKey);
      setOf(contractAddr, stringToBytes("massaProto"), protos);
    }
    if (functionExists(contractAddr, CONSTRUCTOR)) {
      let argsIdent = new Uint8Array(1);
      argsIdent[0] = 0x00;
      let keyArgs = keyBaseArgs.add(argsIdent).serialize();
      let coinsIdent = new Uint8Array(1);
      coinsIdent[0] = 0x01;
      let keyCoins = keyBaseCoins.add(coinsIdent).serialize();
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
      call(contractAddr, CONSTRUCTOR, args, coins);
    }
    generateEvent(`Contract deployed at address: ${contractAddr.toString()}`);
  }
  return [];
}
