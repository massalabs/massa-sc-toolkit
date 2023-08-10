/* eslint-disable no-console */
import { ProtoFile } from './protobuf.js';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, relative, join } from 'path';
import { default as tsProtoTypes } from './tsProtoTypes.json' assert { type: 'json' };

interface ReturnType {
  [key: string]: string;
}
const returnType: ReturnType = tsProtoTypes;


/**
 * Compile proto file to TypeScript helper class.
 *
 * @remarks
 * - The ts helper file is generated in the folder 'helpers' at the same location as your current terminal.
 * - If the @see protoFilePath is the relative path, it should be based on the location of your terminal
 *
 * @param protoFilePath - The path to the proto file.
 */
export function compileProtoToTSHelper(protoFilePath: string): void {
  // Compile the proto file to a ts file
  // If 'protoFilePath' is absolute, then 'npx protoc' will not work. We need to convert it to relative path
  try {
    execSync(
      `npx protoc --ts_out="./helpers" --proto_path helpers "${convertToRelativePath(
        protoFilePath,
      )}"`,
    );
  } catch (e) {
    throw new Error(
      'Error while compiling the proto file: ' +
        e +
        '\nIs the proto file in a sub folder of the current terminal location?',
    );
  }
}

/**
 * Setup the arguments for the caller function definition.
 *
 * @param protoFile - The proto file object.
 *
 * @returns The formatted arguments for the caller function definition.
 *
 * @throws Error if the type of an argument is not supported.
 */
function setupArguments(protoFile: ProtoFile): string {
  return protoFile.argFields
    .reduce((content, arg) => {
      if (!Object.prototype.hasOwnProperty.call(returnType, arg.type)) {
        throw new Error(`Unsupported type: ${arg.type}`);
      }
      return `${content}${arg.name}: ${returnType[arg.type]}, `;
    }, '')
    .slice(0, -2);
}

/**
 * Generates code to check if unsigned arguments of a protobuf message are negative.
 *
 * @param protoFile - The proto file object.
 *
 * @returns The string containing code for unsigned argument checks.
 */
function generateUnsignedArgCheckCode(protoFile: ProtoFile): string {
  const unsignedPBTypes = new Set(['uint32', 'uint64', 'fixed32', 'fixed64']);

  const checks = protoFile.argFields
    .filter((arg) => unsignedPBTypes.has(arg.type))
    /* eslint-disable max-len */
    .map(
      (arg) =>
        `\t\tif (${arg.name} < 0) throw new Error("Invalid argument: ${arg.name} cannot be negative according to protobuf file.");`,
    );

  const unsignedPBArrayTypes = new Set([
    'uint32[]',
    'uint64[]',
    'fixed32[]',
    'fixed64[]',
  ]);
  const checksArray = protoFile.argFields
    .filter((arg) => unsignedPBArrayTypes.has(arg.type))
    /* eslint-disable max-len */
    .map(
      (arg) =>
        `\t\tif (${arg.name}.some((e) => e < 0)) throw new Error("Invalid argument: ${arg.name} cannot contain negative values according to protobuf file.");`,
    );

  if (checks.length > 0 || checksArray.length > 0) {
    return (
      '// Verify that the given arguments are valid\n' +
      checks.join('\n') +
      '\n' +
      checksArray.join('\n') +
      '\n\n'
    );
  }

  return '';
}

/**
 * Generate the TypeScript code for the ts caller function
 * to serialize the arguments using protobuf.
 *
 * @param protoFile - The protoFile object
 *
 * @returns - The generated serialization arguments
 */
function argumentSerialization(protoFile: ProtoFile): string {
  const args = protoFile.argFields
    .map((arg) => `${arg.name}: ${arg.name}`)
    .join(',\n      ');

  if (protoFile.argFields.length > 0) {
    return `// Serialize the arguments
    const serializedArgs = ${protoFile.funcName}Helper.toBinary({
      ${args}
    });\n`;
  }

  return '';
}

/**
 * Generate argument documentation for ts Caller function
 *
 * @param protoFile - The protoFile object used to generate the documentation
 *
 * @returns - The generated documentation arguments
 */
function generateDocArgs(protoFile: ProtoFile): string {
  return protoFile.argFields
    .map((arg) => `   * @param {${returnType[arg.type]}} ${arg.name} - `)
    .join('\n');
}

/**
 * Generate the TypeScript code for the ts caller function, depending of the chosen mode
 */
function callSCConstructor(mode: string): string {
  if (mode == 'web3') {
    return `{ operationId:
        await account.callSmartContract(
          {
            fee: fee,
            maxGas: maxGas,
            coins: coins,
            targetAddress: contractAddress,
            functionName: functionName,
            parameter: Array.from(args),
          } as ICallData,
        )
      }`;
  }
  if (mode == 'wallet') {
    return `await account.callSC(
        contractAddress,
        functionName,
        args,
        coins,
        fee,
        maxGas,
      )`;
  } else {
    throw Error('Unsupported mode: ' + mode);
  }
}

/**
 * Generate a TypeScript file to allow the user to easily call a function of a Smart Contract
 *
 * @remarks
 * - If the @see helperFilePath is the relative path based on the .proto file path
 * - If the @see outputPath is the relative path based on the location of your terminal
 * - Don't forget to run 'npm install protobuf-ts/plugin' in your project folder for the caller to work
 *
 * @param protoFile - The protoFile object used to generate the caller
 * @param contractAddress - The address of the Smart Contract to interact with (optional)
 */
export function generateTSCaller(
  protoFile: ProtoFile,
  contractAddress: string,
): string {
  // generate the arguments
  const args = setupArguments(protoFile);

  // generate the documentation
  const documentationArgs = generateDocArgs(protoFile);

  // verify that the given arguments are valid
  const checkUnsignedArgs = generateUnsignedArgCheckCode(protoFile);

  // generate the caller function body
  const argsSerialization = argumentSerialization(protoFile);
  // generate the caller function
  return `

  /**
   * This method have been generated by the Massa Proto CLI.
   * It allows you to call the "${protoFile.funcName}" function of the
   * "${contractAddress}" Smart Contract.
   *
   * @remarks
   * To work properly, you need to run 'npm install @protobuf-ts/plugin' in your project folder.
   * Otherwise, this caller will not work.
   *
   ${documentationArgs.slice(3)}
   *
   * @param {bigint} coins - The amount of Massa coins to send to the block creator
   *
   * @returns {Promise<OperationOutputs>} A promise that resolves to an object which contains the outputs and events from the call to ${protoFile.funcName}.
   */
  async ${protoFile.funcName}(${protoFile.argFields.length > 0 ? `${args}, ` : ''}
  fee?: bigint, maxGas?:bigint): Promise<OperationOutputs> {
    ${checkUnsignedArgs}${argsSerialization}
    // Send the operation to the blockchain and retrieve its outputs
    if(!fee) fee = this.fee;
    if(!maxGas) maxGas = this.maxGas;
    return (
      await ${protoFile.funcName}ExtractOutputsAndEvents(
        '${contractAddress}',
        '${protoFile.funcName}',
        ${protoFile.argFields.length > 0 ? 'serializedArgs' : 'new Uint8Array()'},
        this.coins,
        '${protoFile.resType == 'void' ? 'void' : returnType[protoFile.resType]}',
        this.account,
        this.nodeRPC,
        fee,
        maxGas,
      )
    );
  }

`;

  // // save content to file
  // const fileName = `${protoFile.funcName}Caller.ts`;
  // if (outputPath.slice(-1) != '/') {
  //   outputPath += '/';
  // }
  // writeFileSync(`${outputPath}${fileName}`, content, 'utf8');
}

function generateCommonHelperFile(outputPath: string, mode: string) {
  const content = `/*****************HELPER GENERATED BY MASSA-PROTO-CLI*****************/

import {
  Client,
  IClientConfig,
  IEventFilter,
  IProvider,
  ProviderType,
  EventPoller,
  ON_MASSA_EVENT_DATA,
  ON_MASSA_EVENT_ERROR,
  IEvent,
  INodeStatus,
  withTimeoutRejection,
} from "@massalabs/massa-web3";
${
  mode == 'wallet'
    ? 'import { IAccount } from "@massalabs/wallet-provider";\n'
    : ''
}
export const MASSA_EXEC_ERROR = 'massa_execution_error';

/**
 * This interface represents the result of the event poller.
 *
 * @see isError - A boolean indicating wether the Smart Contract call has failed or not
 * @see eventPoller - The eventPoller object
 * @see events - The events emitted by the Smart Contract call
 */
export interface EventPollerResult {
  isError: boolean;
  eventPoller: EventPoller;
  events: IEvent[];
}

/**
 * This interface represents the details of the transaction.
 *
 * @see operationId - The operationId of the Smart Contract call
 */
export interface TransactionDetails {
  operationId: string;
}
/**
 * This method have been generated by the Massa Proto CLI.
 * It sets up all the objects needed to poll the events generated by a smart contract function.
 *
 * @param {TransactionDetails} txDetails - An object containing the operationId of SC call.
 * @param {string} nodeUrl - The url of the node to connect to.
 *
 * @returns {Promise<EventPollerResult>} An object containing the eventPoller and the events.
 */
export async function getEvents(txDetails: TransactionDetails, nodeUrl: string): Promise<IEvent[]>{
  const opId = txDetails.operationId;

  // setup the providers
  const providerPub: IProvider = {
    url: nodeUrl,
    type: ProviderType.PUBLIC,
  };

  // setup the client config
  const clientConfig: IClientConfig = {
    providers: [providerPub],
    periodOffset: null,
  };
  // setup the client
  const client = new Client(clientConfig);

  // async poll events in the background for the given opId
  const { isError, eventPoller, events }: EventPollerResult =
    await withTimeoutRejection<EventPollerResult>(
      pollAsyncEvents(client, opId),
      20000,
    );

  // stop polling
  eventPoller.stopPolling();

  // if errors, don't await finalization
  if (isError) {
    throw new Error(
      'Massa Operation Error: ' + JSON.stringify(events, null, 4),
    );
  }

  return events;
}

/**
 * Asynchronously polls events from the chain for a given operationId
 *
 * @param web3Client - an initialized web3 client
 * @param opId - the operation id whose events are to be polled
 *
 * @throws in case of a timeout or massa execution error
 *
 * @returns A promise that resolves to an 'EventPollerResult'
 *
 */
const pollAsyncEvents = async (
  web3Client: Client,
  opId: string,
): Promise<EventPollerResult> => {
  console.log('Operation Id: ', opId);
  console.log('Polling for events...');
  // determine the last slot
  let nodeStatusInfo: INodeStatus | null | undefined = await web3Client
    .publicApi()
    .getNodeStatus();

  // set the events filter
  const eventsFilter = {
    start: { period: nodeStatusInfo.last_slot.period - 2, thread: nodeStatusInfo.last_slot.thread }, // last slot - 2 to avoid missing events
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
      let errorEvents: IEvent[] = events.filter((e) =>
        e.data.includes(MASSA_EXEC_ERROR),
      );
      if (errorEvents.length > 0) {
        return resolve({
          isError: true,
          eventPoller,
          events: errorEvents,
        } as EventPollerResult);
      }

      if (events.length > 0) {
        return resolve({
          isError: false,
          eventPoller,
          events,
        } as EventPollerResult);
      } else {
        console.log('No events have been emitted');
      }
    });
    eventPoller.on(ON_MASSA_EVENT_ERROR, (error: Error) => {
      console.log('Event Data Error:', error);
      return reject(error);
    });
  });
};
`;

  // save content to file
  const fileName = `commonHelper.ts`;
  writeFileSync(`${outputPath}${fileName}`, content, 'utf8');
  console.log(`Common helper file generated at: ${outputPath}`);
}

/**
 * generate a personalized extractOutputsAndEvents function for each proto file
 *
 * @param protoFile - The protoFile object
 * @param mode - The generation mode
 * @param outputPath - The path where the file will be generated
 * @param contractName - The name of the contract
 */
function generatePollerFunction(
  protoFile: ProtoFile,
  mode: string,
  outputPath: string,
  contractName: string,
) {
  // add some functions and interfaces to the helper file
  // check if the helper file exists in the outputPath
  if (outputPath.slice(-1) != '/' || outputPath.slice(-1) != '\\') {
    outputPath += '/';
  }
  if (existsSync(`${outputPath}${protoFile.funcName}Helper.ts`)) {
    // read the helper file
    let helperFile = readFileSync(
      `${outputPath}${protoFile.funcName}Helper.ts`,
      'utf8',
    );
    const helperImports = `
/*****************IMPORTS GENERATED BY MASSA-PROTO-CLI*****************/

import {
  OperationOutputs,
} from "./${contractName}Caller";
import { getEvents } from "./commonHelper";
import {
  IEvent,${
    mode == 'web3'
      ? `\n  SmartContractsClient,
  ICallData,`
      : ''
}
} from "@massalabs/massa-web3";
${mode == 'wallet'? 'import { IAccount, providers } from "@massalabs/wallet-provider";\n': ''}

`;

    // add the interfaces and functions
    helperFile += `


/*****************GENERATED BY MASSA-PROTO-CLI*****************/

const OUTPUTS_PREFIX = 'Result${protoFile.funcName}:';

export async function ${protoFile.funcName}ExtractOutputsAndEvents(
  contractAddress: string,
  functionName: string,
  args: Uint8Array,
  coins: bigint,
  returnType: string,
  account: ${mode == 'web3' ? 'SmartContractsClient' : 'IAccount'},
  nodeUrl: string,
  fee = 0n,
  maxGas = BigInt(4_294_967_295), // = max block gas limit
): Promise<OperationOutputs> {

  let events: IEvent[] = [];

  // try to call the Smart Contract
  try{
    events = await getEvents(
      ${callSCConstructor(mode)},
      nodeUrl,
    )
  }
  catch (err) {
    return {
      events: events,
    } as OperationOutputs;
  }

  // if the call is successful, retrieve the outputs from the events
  let rawOutput: string | null = null;
  for (let event of events) {
    if (event.data.slice(0, OUTPUTS_PREFIX.length) == OUTPUTS_PREFIX) {
      rawOutput = event.data.slice(OUTPUTS_PREFIX.length);
      // remove the event from the list
      events.splice(events.indexOf(event), 1);
      break;
    }
  }

  // check the output and return the result
  if (rawOutput === null && returnType !== 'void') {
    const detectedEventsData = events.map((e) => e.data);
    throw new Error(
      'Output expected but not found. Events detected:\\n' + '[ ' + detectedEventsData.join(' ]\\n[ ') + ' ]',
    );
  }
  if(rawOutput === null && returnType === 'void') {
    return{
      events: events,
    };
  }
  if(rawOutput !== null && returnType !== 'void') {
    ${
      protoFile.resType == 'void'
        ? ''
        : `let output: Uint8Array = new Uint8Array(Buffer.from(rawOutput, 'base64'));
    // try to deserialize the outputs
    let deserializedOutput: ${
      returnType[protoFile.resType]
        ? returnType[protoFile.resType]
        : 'Unknown_type'
    };
    try{
      deserializedOutput = ${
        protoFile.funcName
      }RHelper.fromBinary(output).value;
    }
    catch (err) {
      throw new Error(
        'Deserialization Error: ' + err + 'Raw Output: ' + rawOutput,
      );
    }
    `}
    return {${protoFile.resType == 'void' ? '' : `\n      outputs: deserializedOutput,`}
      events: events,
    } as OperationOutputs;
  }
  throw new Error('${protoFile.funcName}Caller: Unexpected error');
}


`;

    // save the helper file
    writeFileSync(
      `${outputPath}${protoFile.funcName}Helper.ts`,
      helperImports +
        '\n/*****************GENERATED BY PROTOC*****************/\n\n' +
        helperFile,
      'utf8',
    );
    console.log(
      `Helper file: ${protoFile.funcName}Helper.ts updated at: ${outputPath}`,
    );
  }
}

function generateCommonCallerFile(
  protoFiles: ProtoFile[],
  mode: string,
  contractName: string,
): string {
  // import the ${protoFile.funcName}ExtractOutputsAndEvents functions
  let imports = '';
  for (let protoFile of protoFiles) {
    imports += `import { ${protoFile.funcName}ExtractOutputsAndEvents${
      protoFile.argFields.length > 0 ? `, ${protoFile.funcName}Helper` : ''
    } } from "./${protoFile.funcName}Helper";\n`;
  }
  return `
${imports.slice(0, -1)}
import {
  IEvent,${
    mode == 'web3'
      ? `\n  ProviderType,
  SmartContractsClient,
  PublicApiClient,
  IAccount,
  WalletClient,
  Web3Account,`
      : ''
}
} from "@massalabs/massa-web3";
${
  mode == 'wallet'
    ? 'import { IAccount, providers } from "@massalabs/wallet-provider";\n'
    : ''
}

/**
 * This interface is used to represents the outputs of the SC call.
 *
 * @see outputs - The outputs of the SC call (optional)
 * @see events - The events emitted by the SC call (optional)
 */
export interface OperationOutputs {
  outputs?: any;
  events: IEvent[];
}


export class ${contractName[0].toUpperCase() + contractName.slice(1)}BlockchainCaller {
  private nodeRPC: string;

  public account: ${mode == 'web3' ? 'SmartContractsClient' : 'IAccount'};
  public coins: bigint;
  public fee: bigint = 0n;
  public maxGas: bigint = BigInt(4_294_967_295); // = max block gas limit


  constructor(account: ${mode == 'web3' ? 'SmartContractsClient' : 'IAccount'}, coins: bigint, nodeRPC: string, fee?: bigint, maxGas?: bigint) {
    this.nodeRPC = nodeRPC;
    this.account = account;
    this.coins = coins;
    if(fee) this.fee = fee;
    if(maxGas) this.maxGas = maxGas;
  }

  /**
   * This method have been generated by the Massa Proto CLI.
   * It allows you to instantiate a new ${contractName[0].toUpperCase() + contractName.slice(1)}BlockchainCaller object with the default values.
   * ${
     mode == 'web3'
       ? ''
       : `
   * @param {string} providerName - The name of the provider to use
   * @param {number} accountIndex - The index of the account to use in the provider's list of accounts
   * `}
   * @returns {Promise<${contractName[0].toUpperCase() + contractName.slice(1)}BlockchainCaller>} A promise that resolves to a new ${contractName[0].toUpperCase() + contractName.slice(1)}BlockchainCaller object
   */
  static async newDefault(${
    mode == 'web3' ? '' : 'providerName: string, accountIndex: number'}): Promise<${contractName[0].toUpperCase() + contractName.slice(1)}BlockchainCaller> {
    ${
      mode == 'web3'
        ? `// check if the environment variables are set
    if (!process.env.NODE_RPC) {
      throw new Error('NODE_RPC environment variable is not set');
    }
    if (!process.env.ACCOUNT_SECRET_KEY) {
      throw new Error('ACCOUNT_SECRET_KEY environment variable is not set');
    }
    const providerPub = {
      url: process.env.NODE_RPC,
      type: ProviderType.PUBLIC,
    };
    const clientConfig = {
      providers: [providerPub],
      periodOffset: null,
    };
    const publicApiClient = new PublicApiClient(clientConfig);
    const iaccount: IAccount = await WalletClient.getAccountFromSecretKey(process.env.ACCOUNT_SECRET_KEY);
    const account = new Web3Account(iaccount, publicApiClient);
    const walletClient = new WalletClient(clientConfig, publicApiClient, account);
    const SC_Client = new SmartContractsClient(
      clientConfig,
      publicApiClient,
      walletClient,
    );`
        : `// get the available providers
    const provider = await providers();
    // chose the provider
    const providerToUse = provider.find((p) => String(p.name()) === providerName);
    if (!providerToUse) {
      throw new Error("Provider '" + providerName + "'not found");
    }`}
    return new ${contractName[0].toUpperCase() + contractName.slice(1)}BlockchainCaller(${
    mode == 'web3'
      ? 'SC_Client'
      : '(await providerToUse.accounts())[accountIndex]'}, 0n, ${
    mode == 'web3'
      ? 'process.env.NODE_RPC'
      : '(await providerToUse.getNodesUrls())[0]'});
  }
`;
}

/**
 * Convert the given path to a relative path based on the current terminal path.
 *
 * @param absolutePath - The absolute path to convert.
 *
 * @returns The relative path based on the current terminal path.
 */
function convertToRelativePath(absolutePath: string): string {
  return relative(process.cwd(), absolutePath);
}

/**
 * Convert the given path to an absolute path.
 *
 * @param givenPath - The path to convert.
 *
 * @returns The absolute path.
 */
function convertToAbsolutePath(givenPath: string): string {
  if (givenPath.startsWith('.')) {
    return resolve(givenPath);
  }
  return givenPath;
}

/**
 * Creates types script smart contract callers with the given protobuf files.
 *
 * @param protoFiles - the array of proto files objects
 * @param address - the address of the contract where the proto files are coming from (optional)
 * @param outputDirectory - the output directory where to generates the callers
 */
export function generateTsCallers(
  protoFiles: ProtoFile[],
  outputDirectory: string,
  address: string,
  mode: string,
  contractName: string,
) {
  // check the mode
  if (mode != 'web3' && mode != 'wallet')
    throw new Error('Error: mode must be either "web3" or "wallet".');
  // generate the helper file for each proto file
  for (let protoFile of protoFiles) {
    // generate the helper file using protoc. Throws an error if the command fails.
    // protoPath is mandatory to generate the helper file
    if (!protoFile.protoPath) throw new Error('Error: protoPath is undefined.');
    try {
      compileProtoToTSHelper(protoFile.protoPath);
    } catch (e) {
      throw new Error('Error while generating the helper file: ' + e);
    }
    // Get the new location for the helper file (it should be in the same folder as the caller file)
    let newLocation = convertToAbsolutePath(outputDirectory);

    // New location and renaming = absolute_outputPath + protoFile.funcName + 'Helper.ts'
    if (!newLocation.endsWith('/') && !newLocation.endsWith('\\')) {
      newLocation += '/' + protoFile.funcName + 'Helper.ts';
    } else {
      newLocation += protoFile.funcName + 'Helper.ts';
    }
    const helperPath = protoFile.protoPath.replace('.proto', '.ts');
    // join "./helpers/" and helperPath
    const startPath = join(helperPath);

    // check the os to use the correct command to rename the helper file
    if (process.platform === 'win32') {
      execSync(`move "${startPath}" "${newLocation}"`);
    } else {
      execSync(`mv "${startPath}" "${newLocation}"`);
    }

    // add the event pollerClass into the helper file
    generatePollerFunction(protoFile, mode, outputDirectory, contractName);
  }
  // generate the common helper file
  generateCommonHelperFile(outputDirectory, mode);

  // generate the common part of the caller file
  const part1 = generateCommonCallerFile(protoFiles, mode, contractName);

  // generate the caller method file for each proto file
  let part2 = '';
  for (let protoFile of protoFiles) {
    part2 += generateTSCaller(protoFile, address);
  }

  const part3 = `  /**
  * This method have been generated by the Massa Proto CLI.
  * It allows you to update the amount of Massa coins to send to the block creator when calling the Smart Contract.
  */
 editCoins(coins: bigint) {
   this.coins = coins;
 }
}
`;

  // save the caller file
  const fileName = `${contractName}Caller.ts`;
  if (outputDirectory.slice(-1) != '/') {
    outputDirectory += '/';
  }
  writeFileSync(`${outputDirectory}${fileName}`, part1 + part2 + part3, 'utf8');
  console.log(`Main caller: ${fileName} generated at: ${outputDirectory}`);
}
