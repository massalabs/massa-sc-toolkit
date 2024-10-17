import {
  Account,
  bytesToStr,
  SmartContract,
  Web3Provider,
} from '@massalabs/massa-web3';
import 'dotenv/config';

// Paste the address of the deployed contract here
const CONTRACT_ADDR = 'AS12N5DvTVwvaLbaniMgDJqKwJ3uXBGwzzGuB1f6fjeSx3nhhahTE';

const account = await Account.fromEnv();
const provider = Web3Provider.buildnet(account);

const helloContract = new SmartContract(provider, CONTRACT_ADDR);

const messageBin = await helloContract.read('hello');

// deserialize message
const message = bytesToStr(messageBin.value);

console.log(`Received from the contract: ${message}`);
