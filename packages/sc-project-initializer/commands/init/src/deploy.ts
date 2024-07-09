/* eslint-disable no-console */
import {
  Account,
  Args,
  JsonRPCClient,
  Mas,
  SmartContract,
} from '@massalabs/massa-web3';
import { getScByteCode } from './utils';

async function deploy() {
  const client = JsonRPCClient.buildnet();
  const account = await Account.fromEnv();

  console.log('Deploying contract...');

  const contract = await SmartContract.deploy(client, account, {
    byteCode: getScByteCode('build', 'main.wasm'),
    parameter: new Args().addString('Massa').serialize(),
    coins: Mas.fromString('0.01'),
  });

  console.log('Contract deployed at: ', contract.address.toString());

  const events = await client.getEvents({
    smartContractAddress: contract.address.toString(),
    isFinal: true,
  });

  for (const event of events) {
    console.log('Event: ', event.data);
  }
}

deploy();
