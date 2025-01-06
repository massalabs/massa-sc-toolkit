import {
  bytesToStr,
  SmartContract,
  JsonRpcProvider,
} from '@massalabs/massa-web3';
import 'dotenv/config';

// Paste the address of the deployed contract here
const CONTRACT_ADDR = 'AS12N5DvTVwvaLbaniMgDJqKwJ3uXBGwzzGuB1f6fjeSx3nhhahTE';

// Here we only use the read method of the contract so we don't need an account
// provider will be a JsonRpcPublicProvider instance
const provider = JsonRpcProvider.buildnet();

const helloContract = new SmartContract(provider, CONTRACT_ADDR);

const messageBin = await helloContract.read('hello');

// deserialize message
const message = bytesToStr(messageBin.value);

console.log(`Received from the contract: ${message}`);
