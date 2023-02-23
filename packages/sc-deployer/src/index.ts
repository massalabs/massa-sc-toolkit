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
  MassaCoin,
  u64ToBytes,
  u8toByte,
  ON_MASSA_EVENT_DATA,
  ON_MASSA_EVENT_ERROR,
  EventPoller,
  IEventFilter,
  INodeStatus,
} from '@massalabs/massa-web3';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import BigNumber from 'bignumber.js';
import { time } from '@massalabs/massa-web3';

const MASSA_EXEC_ERROR = 'massa_execution_error';

interface ISCData {
  data: Uint8Array;
  args?: Args;
  coins: MassaCoin;
}

interface IEventPollerResult {
  isError: boolean;
  eventPoller: EventPoller;
  events: IEvent[];
}

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

interface IDeploymentInfo {
  opId: string;
  events?: IEvent[];
}

/**
 * Check the balance
 *
 * @param web3Client - an initialized web3 client
 * @param account - the wallet whose balance is being checked
 * @param requiredBalance - the required balance to check against
 * @throws if the given account has insufficient founds
 */
async function checkBalance(
  web3Client: Client,
  account: IAccount,
  requiredBalance: BigNumber,
) {
  if (account.address === null) {
    throw new Error('Account has no address.');
  }
  const balance = await web3Client
    .wallet()
    .getAccountBalance(account.address as string);
  console.log(
    `Wallet Address: ${
      account.address
    } has balance (candidate, final) = (${balance?.candidate.rawValue()}, ${balance?.final.rawValue()}) MAS`,
  );
  if (!balance?.final || balance.final.rawValue().lt(requiredBalance)) {
    throw new Error('Insufficient MAS balance.');
  }
}

/**
 * Awaits a transaction to be finalized
 *
 * @param web3Client - an initialized web3 client
 * @param deploymentOperationId - the operation id that is to be awaited for finality
 * @throws if the given account has insufficient founds
 */
async function awaitOperationFinalization(
  web3Client: Client,
  operationId: string,
): Promise<void> {
  console.log(`Awaiting FINAL transaction status....`);
  let status: EOperationStatus;
  try {
    status = await web3Client
      .smartContracts()
      .awaitRequiredOperationStatus(operationId, EOperationStatus.FINAL);
    console.log(
      `Transaction with Operation ID ${operationId} has reached finality!`,
    );
  } catch (ex) {
    const msg = `Error getting finality of transaction ${operationId}`;
    console.error(msg);
    throw ex;
  }

  if (status !== EOperationStatus.FINAL) {
    let msg = `Transaction ${operationId} did not reach finality after considerable amount of time.`;
    msg += 'Try redeploying anew';
    console.error(msg);
    throw new Error(msg);
  }
}

/**
 * Asynchronously polls events from the chain for a given operationId
 *
 * @param web3Client - an initialized web3 client
 * @param opId - the operation id whose events are to be polled
 * @returns An interface of type `IEventPollerResult` which contains the results or an error
 * @throws in case of a timeout or massa execution error
 */
const pollAsyncEvents = async (
  web3Client: Client,
  opId: string,
): Promise<IEventPollerResult> => {
  // determine the last slot
  let nodeStatusInfo: INodeStatus | null | undefined = await web3Client
    .publicApi()
    .getNodeStatus();

  // set the events filter
  const eventsFilter = {
    start: (nodeStatusInfo as INodeStatus).last_slot,
    end: null,
    original_caller_address: null,
    original_operation_id: opId,
    emitter_address: null,
    is_final: false,
  } as IEventFilter;

  const eventPoller = EventPoller.startEventsPolling(
    eventsFilter,
    1000,
    web3Client,
  );

  return new Promise((resolve, reject) => {
    eventPoller.on(ON_MASSA_EVENT_DATA, (events: Array<IEvent>) => {
      console.log('Event Data Received:', events);
      let errorEvents: IEvent[] = events.filter((e) =>
        e.data.includes(MASSA_EXEC_ERROR),
      );
      if (errorEvents.length > 0) {
        return resolve({
          isError: true,
          eventPoller,
          events: errorEvents,
        } as IEventPollerResult);
      }

      if (events.length > 0) {
        return resolve({
          isError: false,
          eventPoller,
          events,
        } as IEventPollerResult);
      } else {
        console.log('No events have been emitted during deployment');
      }
    });
    eventPoller.on(ON_MASSA_EVENT_ERROR, (error: Error) => {
      console.log('Event Data Error:', error);
      return reject(error);
    });
  });
};

/**
 * Deploys multiple smart contracts.
 *
 * This function will go through all provided smart contracts.
 * For each one, it will deploy the contract and call its constructor function with given arguments in the same
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
 * The smart-contract information is stored in the operation datastore with the following structure.
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

  // check deployer account balance
  const coinsRequired = contracts.reduce(
    (acc, contract) => acc.plus(contract.coins.rawValue()),
    new BigNumber(0),
  );
  await checkBalance(client, account, coinsRequired);

  // construct a new datastore
  let datastore = new Map<Uint8Array, Uint8Array>();

  // set the number of contracts
  datastore.set(new Uint8Array([0x00]), u64ToBytes(BigInt(contracts.length)));

  // loop through all contracts and fill datastore
  contracts.forEach((contract, i) => {
    datastore.set(u64ToBytes(BigInt(i + 1)), contract.data);
    if (contract.args) {
      datastore.set(
        new Uint8Array(
          new Args()
            .addU64(BigInt(i + 1))
            .addUint8Array(u8toByte(0))
            .serialize(),
        ),
        new Uint8Array(contract.args.serialize()),
      );
    }
    if (contract.coins.rawValue().isGreaterThan(0)) {
      datastore.set(
        new Uint8Array(
          new Args()
            .addU64(BigInt(i + 1))
            .addUint8Array(u8toByte(1))
            .serialize(),
        ),
        u64ToBytes(BigInt(contract.coins.toNumber())), // scaled value to be provided here
      );
    }
  });

  const coins = contracts.reduce(
    (acc, contract) => acc + contract.coins.toNumber(),
    0,
  ); // scaled value to be provided here
  console.log(`Sending operation with ${coins} MAS coins...`);
  const opId = await client.smartContracts().deploySmartContract(
    {
      fee,
      maxGas,
      coins,
      contractDataBinary: readFileSync(
        path.join(__dirname, '..', 'build', '/deployer.wasm'),
      ),
      datastore,
    } as IContractData,
    account,
  );
  console.log(`Operation successfully submitted with id: ${opId}`);

  if (!wait) {
    return {
      opId,
    } as IDeploymentInfo;
  }

  console.log('Waiting for events...');

  // async poll events in the background for the given opId
  const { isError, eventPoller, events }: IEventPollerResult =
    await time.withTimeoutRejection<IEventPollerResult>(
      pollAsyncEvents(client, opId),
      20000,
    );

  // stop polling
  eventPoller.stopPolling;

  // if errors, don't await finalization
  if (isError) {
    throw new Error(
      `Massa Deployment Error: ${JSON.stringify(events, null, 4)}`,
    );
  }

  // await finalization
  await awaitOperationFinalization(client, opId);

  return {
    opId,
    events,
  } as IDeploymentInfo;
}

export { IAccount, WalletClient, deploySC, ISCData, IDeploymentInfo };
