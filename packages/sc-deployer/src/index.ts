import {
  Args,
  Client,
  ClientFactory,
  ProviderType,
  IAccount,
  WalletClient,
  IContractData,
  IProvider,
  EOperationStatus,
} from '@massalabs/massa-web3';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export interface ISCData {
  data: Uint8Array;
  args?: Args;
  coins: number;
}

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

async function deploySC(
  publicApi: string,
  account: IAccount,
  contracts: ISCData[],
  fee: number = 0,
  maxGas: number = 1_000_000,
  wait: boolean = false,
) {
  const client: Client = await ClientFactory.createCustomClient(
    [
      { url: publicApi, type: ProviderType.PUBLIC } as IProvider,
      // This IP is false but we don't need private for this script so we don't want to ask one to the user
      // but massa-web3 requires one
      { url: publicApi, type: ProviderType.PRIVATE } as IProvider,
    ],
    true,
    account,
  );

  await checkBalance(client, account);

  let datastore = new Map<Uint8Array, Uint8Array>();
  // The SCs information are stored in operation datastore with the following structure.
  //
  // key [0] : Contains the numbers of SC to deploy
  //
  // key [0, 0, 0, 1]
  // ...
  // key [x, x, x, x]: contains the bytecode of each SC. The 4 bytes of the key is the index (in 4 bytes) of the contract in the list of contracts to be deployed
  //
  // key [0, 0, 0, 1, 0, 0, 0, 0]
  // ...
  // key [x, x, x, x, 0, 0, 0, 0]: optional key that have the args for each contract
  //
  // key [0, 0, 0, 1, 0, 0, 0, 1]
  // ...
  // key [x, x, x, x, 0, 0, 0, 1]: optional key that have the coins for each contract

  datastore.set(
    new Uint8Array([0x00]),
    new Uint8Array(new Args().addU64(BigInt(contracts.length)).serialize()),
  );
  contracts.forEach((contract, i) => {
    datastore.set(
      new Uint8Array(new Args().addU64(BigInt(i + 1)).serialize()),
      contract.data,
    );
    if (contract.args) {
      datastore.set(
        new Uint8Array(
          new Args()
            .addU64(BigInt(i + 1))
            .addUint8Array(new Uint8Array([0x00]))
            .serialize(),
        ),
        new Uint8Array(contract.args.serialize()),
      );
    }
    if (contract.coins > 0) {
      datastore.set(
        new Uint8Array(
          new Args()
            .addU64(BigInt(i + 1))
            .addUint8Array(new Uint8Array([0x01]))
            .serialize(),
        ),
        new Uint8Array(new Args().addU64(BigInt(contract.coins)).serialize()),
      );
    }
  });

  const opIds = await client.smartContracts().deploySmartContract(
    {
      fee: fee,
      maxGas: maxGas,
      coins: contracts.reduce((acc, contract) => acc + contract.coins, 0),
      contractDataBinary: readFileSync(
        path.join(__dirname, '..', 'build', '/deployer.wasm'),
      ),
      datastore,
    } as IContractData,
    account,
  );
  console.log(`Operation submitted with id: ${opIds[0]}`);

  if (!wait) {
    return;
  }

  console.log('Waiting for events...');

  // Wait the end of deployment
  await client
    .smartContracts()
    .awaitRequiredOperationStatus(opIds[0], EOperationStatus.FINAL);

  const event = await client.smartContracts().getFilteredScOutputEvents({
    emitter_address: null,
    start: null,
    end: null,
    original_caller_address: null,
    original_operation_id: opIds[0],
    is_final: null,
  });

  if (event.length) {
    // This prints the deployed SC address
    console.log('Deployment success with events: ');
    event.forEach((e) => {
      console.log(e.data);
    });
  } else {
    console.log('Deployment success. No events has been generated');
  }
}

async function checkBalance(web3Client: Client, deployerAccount: IAccount) {
  const balance = await web3Client
    .wallet()
    .getAccountBalance(deployerAccount.address!);

  console.log('Wallet balance: ', balance?.final);
  if (!balance?.final || !parseFloat(balance.final)) {
    throw new Error(`Insuficient MAS balance.`);
  }
}

export { IAccount, WalletClient, deploySC };
