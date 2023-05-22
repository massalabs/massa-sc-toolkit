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
  u64ToBytes,
  u8toByte,
  ON_MASSA_EVENT_DATA,
  ON_MASSA_EVENT_ERROR,
  EventPoller,
  IEventFilter,
  INodeStatus,
  toMAS,
} from '@massalabs/massa-web3';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { time } from '@massalabs/massa-web3';

const MASSA_EXEC_ERROR = 'massa_execution_error';

/**
 * Interface for smart contract data
 */
interface ISCData {
  data: Uint8Array;
  args?: Args;
  coins: bigint;
}

/**
 * Interface for event poller result
 */
interface IEventPollerResult {
  isError: boolean;
  eventPoller: EventPoller;
  events: IEvent[];
}

/**
 * Used to get the current file name
 */
const __filename = fileURLToPath(import.meta.url);

/**
 * Used to get the current directory name
 */
const __dirname = path.dirname(__filename);

/**
 * Interface for deployment information
 */
interface IDeploymentInfo {
  opId: string;
  events?: IEvent[];
}

/**
 * Check if the balance of a given account is above a given threshold
 *
 * @param web3Client - an initialized web3 client
 * @param account - the wallet whose balance is being checked
 * @param requiredBalance - the required balance to check against
 *
 * @throws if the given account has insufficient founds
 */
async function checkBalance(
  web3Client: Client,
  account: IAccount,
  requiredBalance: bigint,
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
    } has balance (candidate, final) = (${toMAS(
      balance?.candidate.toString() as string,
    )}, ${toMAS(balance?.final.toString() as string)})`,
  );

  if (!balance?.final || balance.final < requiredBalance) {
    throw new Error('Insufficient MAS balance.');
  }
}

/**
 * Awaits a transaction to be finalized
 *
 * @param web3Client - an initialized web3 client
 * @param deploymentOperationId - the operation id that is to be awaited for finality
 *
 * @throws if the given account has insufficient founds
 *
 * @returns a promise that resolves to void when the transaction is finalized
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
 *
 * @throws in case of a timeout or massa execution error
 *
 * @returns A promise that resolves to an `IEventPollerResult` which contains the results or an error
 *
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
 * Estimates the value of the maxCoins maximum number of coins to that should be used while deploying a smart contract.
 *
 * @param contractByteCode - The byte code of the smart contract to be deployed.
 * @param transactionOperationCost - The transaction operation cost in the smallest massa unit.
 * (it should be the same as the 'coins' parameter used in the deploySC function).
 *
 * @returns The estimated value of the maxCoins value in the smallest massa unit.
 */
function estimateMaxCoin(
  contractByteCode: Buffer,
  transactionOperationCost: string,
) {
  const byteCodeSize = BigInt(contractByteCode.length);
  return (
    BigInt(10250000) +
    byteCodeSize * BigInt(250000) +
    BigInt(transactionOperationCost)
  );
}

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
 * @param maxCoins - maximum amount of coins to spend (optional. if not set, we use the estimated value)
 * @returns
 */
async function deploySC(
  publicApi: string,
  account: IAccount,
  contracts: ISCData[],
  maxCoins?: bigint,
  fee = 0n,
  maxGas = 1_000_000n,
  wait = false,
): Promise<IDeploymentInfo> {
  // check if maxCoins is set
  if (!maxCoins) {
    try {
      // estimate the maxCoins value
      maxCoins = estimateMaxCoin(
        readFileSync(path.join(__dirname, '..', 'build', '/main.wasm')),
        contracts
          .reduce((acc, contract) => acc + contract.coins, 0n)
          .toString(),
      );
    } catch (ex) {
      console.log('Error estimating maxCoins value. Using default value.');
      maxCoins = 4_200_000_000n;
    }
  }

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
    (acc, contract) => acc + contract.coins,
    0n,
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
    if (contract.coins > 0) {
      datastore.set(
        new Uint8Array(
          new Args()
            .addU64(BigInt(i + 1))
            .addUint8Array(u8toByte(1))
            .serialize(),
        ),
        u64ToBytes(BigInt(contract.coins)), // scaled value to be provided here
      );
    }
  });

  const coins = contracts.reduce((acc, contract) => acc + contract.coins, 0n); // scaled value to be provided here
  console.log(`Sending operation with ${toMAS(coins)} MAS coins...`);
  const opId = await client.smartContracts().deploySmartContract(
    {
      contractDataBinary: readFileSync(
        path.join(__dirname, '..', 'build', '/deployer.wasm'),
      ),
      datastore,
      fee,
      maxGas,
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
  eventPoller.stopPolling();

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
