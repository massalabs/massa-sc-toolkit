import { generateEvent, Address } from "@massalabs/massa-as-sdk";

// This function is called when the contract is deployed.
// If you don't want to have code at deployment delete this file (it will cost you less gas)
// `_sc_address` is the address of the contract you deployed
export function init(_sc_address: Address): StaticArray<u8> {
    return [];
}
