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
  IEvent,
} from '@massalabs/massa-web3';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

interface ISCData {
  data: Uint8Array;
  args?: Args;
  coins: number;
}

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

interface IDeploymentInfo {
  opId: string;
  events?: IEvent[];
}

/**
 * Deploys multiple smart contract.
 *
 * This function will go throw all provided smart contracts.
 * For each one, it will deploy the contract and call its constructor function with the given arguments in the same
 * transaction.
 *
 * @remarks
 * Under the hood, this will generate a deployer smart contract with a main function.
 * This function will deploy your smart contract and call the constructor function if it has one.
 *
 * This generated deployer smart contract will then be ran by an ExecuteSC operation.
 *
 * You smart contract and the constructor function arguments are passed to the deployer smart contract via the operation
 * datastore of the ExecuteSC operation.
 *
 * @privateRemarks
 * The smart contracts information are stored in operation datastore with the following structure.
 *
 * key [0] : Contains the numbers of SC to deploy
 *
 * key [0, 0, 0, 1]
 * ...
 * key [x, x, x, x]: contains the bytecode of each SC. The 4 bytes of the key is the index (in 4 bytes) of the
 * contract in the list of contracts to be deployed
 *
 * key [0, 0, 0, 1, 0, 0, 0, 0]
 * ...
 * key [x, x, x, x, 0, 0, 0, 0]: optional key that have the args for each contract
 *
 * key [0, 0, 0, 1, 0, 0, 0, 1]
 * ...
 * key [x, x, x, x, 0, 0, 0, 1]: optional key that have the coins for each contract
 *
 * @param publicApi - public API node URL
 * @param account - the wallet that will deploy
 * @param contracts - contracts and constructors arguments
 * @param fee - fees to provide to the deployment
 * @param maxGas - maximum amount of gas to spend
 * @param wait - waits for the first event if true
 * @returns
 */
async function deploySC(
  publicApi: string,
  account: IAccount,
  contracts: ISCData[],
  fee = 0,
  maxGas = 1_000_000,
  wait = false,
): Promise<IDeploymentInfo> {
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

  const opId = await client.smartContracts().deploySmartContract(
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
  console.log(`Operation submitted with id: ${opId}`);

  if (!wait) {
    return {
      opId,
    } as IDeploymentInfo;
  }

  console.log('Waiting for events...');

  // Wait the end of deployment
  await client
    .smartContracts()
    .awaitRequiredOperationStatus(opId, EOperationStatus.FINAL);

  const events = await client.smartContracts().getFilteredScOutputEvents({
    emitter_address: null,
    start: null,
    end: null,
    original_caller_address: null,
    original_operation_id: opId,
    is_final: null,
  });

  if (events.length) {
    // This prints the deployed SC address
    console.log('Deployment success with events: ');
    events.forEach((e) => {
      console.log(e.data);
    });
  } else {
    console.log('Deployment success. No events has been generated');
  }
  return {
    opId,
    events,
  } as IDeploymentInfo;
}

/**
 * Check the balance
 *
 * @param web3Client - web3 client to use to check the balance
 * @param account - the wallet
 * @throws if the given account has insufficient founds
 */
async function checkBalance(web3Client: Client, account: IAccount) {
  if (account.address === null) {
    throw new Error('Account has no address.');
  }

  const balance = await web3Client.wallet().getAccountBalance(account.address);

  console.log('Wallet balance: ', balance?.final);
  if (!balance?.final || !parseFloat(balance.final)) {
    throw new Error('Insufficient MAS balance.');
  }
}

export { IAccount, WalletClient, deploySC, ISCData, IDeploymentInfo };
