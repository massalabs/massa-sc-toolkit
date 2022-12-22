import {
    ClientFactory,
    Client,
    DefaultProviderUrls,
    IAccount,
    IContractData
} from "@massalabs/massa-web3";
import { readFileSync } from "fs";

// create a base account for signing transactions
const baseAccount = {
  address: 'A1249cYYFbT1BwHdzTQhgf6pv1S6ZLQjd6VReAbbQf9pb4BE4ziU',
  secretKey: 'S126gPee3LJwrQEPqukJ26f6bHG8t5GPwH1WHhR9VpyqrkhkLCGf',
  publicKey: 'P12vnX43yGeW4hmiKQ715SKssGbkLNXayZNbfFonyhVoFAhWhumj'
} as IAccount;

// initialize a client
const client: Client = await ClientFactory.createDefaultClient(
    DefaultProviderUrls.LOCALNET, // Change to testnet
    true,
    baseAccount
);

let op_datastore = new Map<Uint8Array, Uint8Array>();
op_datastore.set(new Uint8Array([0x00]), readFileSync('./build/deployer.wasm'));

// deploy the deployer
console.log(await client.smartContracts().deploySmartContract({
  fee: 0,
  maxGas: 1000000,
  contractDataBinary: readFileSync('./build/main.wasm'),
  datastore: op_datastore
} as IContractData, baseAccount));