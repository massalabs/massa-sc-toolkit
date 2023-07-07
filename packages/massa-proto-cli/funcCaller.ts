import { encodefuncHelper, funcHelper } from './funcHelper';
import { decodefuncRHelper } from './funcRHelper';
import { call, Address } from "@massalabs/massa-as-sdk";
import { Args } from '@massalabs/as-types';

export function func( coins: u64): undefined {

  const result = call(
    new Address("ANYADDR"),
    "func",
    new Args(changetype<StaticArray<u8>>(encodefuncHelper(new funcHelper(
      
    )))),
    coins
  );

  // Convert the result to the expected response type
  const response = decodefuncRHelper(Uint8Array.wrap(changetype<ArrayBuffer>(result)));

  return response.value;
}
