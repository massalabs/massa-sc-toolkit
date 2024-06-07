import {
  generateEvent,
  createSC,
  getOpData,
  call,
  functionExists,
  hasOpKey,
  generateRawEvent,
} from '@massalabs/massa-as-sdk';
import { Args } from '@massalabs/as-types';

const CONSTRUCTOR = 'constructor';

/**
 * This function deploys and calls the constructor function of the deployed smart contract.
 *
 * The data structure of the operation datastore must be like describe in
 * packages/sc-deployer/src/index.ts
 *
 * @param _ - not used
 */
export function main(_: StaticArray<u8>): void {
  let nbSC = getNbSC();

  const deployedSC: string[] = [];

  for (let i: u64 = 0; i < nbSC; i++) {
    const contractAddr = createSC(getScByteCode(i));

    if (functionExists(contractAddr, CONSTRUCTOR)) {
      call(contractAddr, CONSTRUCTOR, getArgs(i), getCoins(i));
    }

    generateEvent(`Contract deployed at address: ${contractAddr.toString()}`);
    deployedSC.push(contractAddr.toString());
  }

  generateRawEvent(new Args().add(deployedSC).serialize());
}

function getNbSC(): u64 {
  let nbSCKey = new StaticArray<u8>(1);
  nbSCKey[0] = 0x00;
  assert(hasOpKey(nbSCKey), 'The number of smart contract is not defined.');
  const nbSCSer = getOpData(nbSCKey);
  return new Args(nbSCSer).mustNext<u64>('nbSC');
}

function getScByteCode(i: u64): StaticArray<u8> {
  const keyScByteCode = new Args().add(i + 1).serialize();
  // What happen if fail for the second contract, is the first one deployed ?
  assert(
    hasOpKey(keyScByteCode),
    `No bytecode found for contract number: ${i + 1}`,
  );

  return getOpData(keyScByteCode);
}

function getKeyArgs(i: u64): StaticArray<u8> {
  let argsIdentifier = new StaticArray<u8>(1);
  argsIdentifier[0] = 0x00;
  return new Args()
    .add(i + 1)
    .add(argsIdentifier)
    .serialize();
}

function getArgs(i: u64): Args {
  const keyArgs = getKeyArgs(i);
  return hasOpKey(keyArgs) ? new Args(getOpData(keyArgs)) : new Args();
}

function getKeyCoins(i: u64): StaticArray<u8> {
  let coinsIdentifier = new StaticArray<u8>(1);
  coinsIdentifier[0] = 0x01;
  return new Args()
    .add(i + 1)
    .add(coinsIdentifier)
    .serialize();
}

function getCoins(i: u64): u64 {
  let keyCoins = getKeyCoins(i);

  return hasOpKey(keyCoins)
    ? new Args(getOpData(keyCoins)).next<u64>().unwrapOrDefault()
    : 0;
}
