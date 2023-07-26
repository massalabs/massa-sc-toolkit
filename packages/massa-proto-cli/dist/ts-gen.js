"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTsCallers = exports.generateTSCaller = exports.compileProtoToTSHelper = void 0;
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const returnType = __importStar(require("./tsProtoTypes.json"));
const path_1 = require("path");
/**
 * Compile proto file to TypeScript helper class.
 *
 * @remarks
 * - The ts helper file is generated in the folder 'helpers' at the same location as your current terminal.
 * - If the @see protoFilePath is the relative path, it should be based on the location of your terminal
 *
 * @param protoFilePath - The path to the proto file.
 */
function compileProtoToTSHelper(protoFilePath) {
    // Compile the proto file to a ts file
    // If 'protoFilePath' is absolute, then 'npx protoc' will not work. We need to convert it to relative path
    try {
        (0, child_process_1.execSync)(`npx protoc --ts_out="./helpers" --proto_path helpers "${convertToRelativePath(protoFilePath)}"`);
    }
    catch (e) {
        throw new Error('Error while compiling the proto file: ' + e +
            '\nIs the proto file in a sub folder of the current terminal location?');
    }
}
exports.compileProtoToTSHelper = compileProtoToTSHelper;
/**
 * Setup the arguments for the caller function definition.
 *
 * @param protoFile - The proto file object.
 *
 * @returns The formatted arguments for the caller function definition.
 *
 * @throws Error if the type of an argument is not supported.
 */
function setupArguments(protoFile) {
    return protoFile.argFields
        .reduce((content, arg) => {
        if (!returnType[arg.type])
            throw new Error(`Unsupported type: ${arg.type}`);
        return `${content}${arg.name}: ${returnType[arg.type]}, `;
    }, '').slice(0, -2);
}
/**
 * Generates code to check if unsigned arguments of a protobuf message are negative.
 *
 * @param protoFile - The proto file object.
 *
 * @returns The string containing code for unsigned argument checks.
 */
function generateUnsignedArgCheckCode(protoFile) {
    const unsignedPBTypes = new Set(['uint32', 'uint64', 'fixed32', 'fixed64']);
    const checks = protoFile.argFields
        .filter((arg) => unsignedPBTypes.has(arg.type))
        /* eslint-disable max-len */
        .map((arg) => `\t\tif (${arg.name} < 0) throw new Error("Invalid argument: ${arg.name} cannot be negative according to protobuf file.");`);
    if (checks.length > 0) {
        return '// Verify that the given arguments are valid\n' + checks.join('\n');
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
function argumentSerialization(protoFile) {
    const args = protoFile.argFields
        .map((arg) => `${arg.name}: ${arg.name}`)
        .join(',\n      ');
    if (protoFile.argFields.length > 0) {
        return `// Serialize the arguments
    const serializedArgs = ${protoFile.funcName}Helper.toBinary({
      ${args}
    });`;
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
function generateDocArgs(protoFile) {
    return protoFile.argFields
        .map((arg) => `   * @param {${returnType[arg.type]}} ${arg.name} - `)
        .join('\n');
}
/**
 * Generate the TypeScript code for the ts caller function, depending of the chosen mode
 */
function callSCConstructor(mode) {
    if (mode == 'web3') {
        return `{ operationId: 
        await account.callSmartContract(
          {
            fee: 1n,
            maxGas: 10000000n,
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
      )`;
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
 * @param outputPath - The path where the file will be generated
 * @param protoFile - The protoFile object used to generate the caller
 * @param contractAddress - The address of the Smart Contract to interact with (optional)
 */
function generateTSCaller(outputPath, protoFile, contractAddress, mode) {
    // check the mode
    if (mode != 'web3' && mode != 'wallet')
        throw new Error('Error: mode must be either "web3" or "wallet".');
    // generate the helper file using protoc. Throws an error if the command fails.
    // protoPath is mandatory to generate the helper file
    if (!protoFile.protoPath)
        throw new Error('Error: protoPath is undefined.');
    try {
        compileProtoToTSHelper(protoFile.protoPath);
    }
    catch (e) {
        throw new Error('Error while generating the helper file: ' + e);
    }
    // Get the new location for the helper file (it should be in the same folder as the caller file)
    let newLocation = convertToAbsolutePath(outputPath);
    // New location and renaming = absolute_outputPath + protoFile.funcName + 'Helper.ts'
    if (!newLocation.endsWith('/') && !newLocation.endsWith('\\')) {
        newLocation += '/' + protoFile.funcName + 'Helper.ts';
    }
    else {
        newLocation += protoFile.funcName + 'Helper.ts';
    }
    const helperPath = protoFile.protoPath.replace('.proto', '.ts');
    // join "./helpers/" and helperPath
    const startPath = (0, path_1.join)(helperPath);
    // check the os to use the correct command to rename the helper file
    if (process.platform === 'win32') {
        (0, child_process_1.execSync)(`move "${startPath}" "${newLocation}"`);
    }
    else {
        (0, child_process_1.execSync)(`mv "${startPath}" "${newLocation}"`);
    }
    // generate the arguments
    const args = setupArguments(protoFile);
    // generate the documentation
    const documentationArgs = generateDocArgs(protoFile);
    // verify that the given arguments are valid
    const checkUnsignedArgs = generateUnsignedArgCheckCode(protoFile);
    // generate the caller function body
    const argsSerialization = argumentSerialization(protoFile);
    // generate the caller function
    const content = `import { 
  ${protoFile.funcName}Helper,
  extractOutputsAndEvents
} from "./${protoFile.funcName}Helper";
import {  
  IEvent,${mode == 'web3' ? `\n  ProviderType,
  SmartContractsClient,  
  PublicApiClient,
  IAccount,
  WalletClient,` : ''}
} from "@massalabs/massa-web3";
${mode == 'wallet' ? 'import { IAccount, providers } from "@massalabs/wallet-provider";\n' : ''}

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


export class ${protoFile.funcName[0].toUpperCase() + protoFile.funcName.slice(1)}BlockchainCaller {
  private nodeRPC: string;

  public account: ${mode == 'web3' ? 'SmartContractsClient' : 'IAccount'};
  public coins: bigint;
  

  constructor(account: ${mode == 'web3' ? 'SmartContractsClient' : 'IAccount'}, coins: bigint, nodeRPC: string) {
    this.nodeRPC = nodeRPC;
    this.account = account;
    this.coins = coins;
  }

  /**
   * This method have been generated by the Massa Proto CLI.
   * It allows you to instantiate a new ${protoFile.funcName[0].toUpperCase() + protoFile.funcName.slice(1)}BlockchainCaller object with the default values.
   * 
   * @param envPath - The path to the .env file (default: './'), relative to the terminal location
   * @returns {Promise<${protoFile.funcName[0].toUpperCase() + protoFile.funcName.slice(1)}BlockchainCaller>} A promise that resolves to a new ${protoFile.funcName[0].toUpperCase() + protoFile.funcName.slice(1)}BlockchainCaller object
   */
  static async newDefault(${mode == 'web3' ? "envPath = './'" : 'providerName: string, accountIndex: string'}): Promise<${protoFile.funcName[0].toUpperCase() + protoFile.funcName.slice(1)}BlockchainCaller> {
    ${mode == 'web3' ? `// check if the environment variables are set
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
    const providerPriv = {
      url: process.env.NODE_RPC,
      type: ProviderType.PRIVATE,
    };
    const clientConfig = {
      providers: [providerPub, providerPriv],
      periodOffset: null,
    };
    const publicApiClient = new PublicApiClient(clientConfig);
    const walletClient = new WalletClient(clientConfig, publicApiClient);
    const account: IAccount = await WalletClient.getAccountFromSecretKey(process.env.ACCOUNT_SECRET_KEY);
    walletClient.setBaseAccount(account);
    const SC_Client = new SmartContractsClient(
      clientConfig,
      publicApiClient,
      walletClient,
    );` : `// get the available providers
    const provider = await providers();
    // chose the provider
    const providerToUse = provider.find((p) => String(p.name) === providerName);
    if (!providerToUse) {
      throw new Error("Provider '" + providerName + "'not found");
    }`}
    return new ${protoFile.funcName[0].toUpperCase() + protoFile.funcName.slice(1)}BlockchainCaller(${mode == 'web3' ? 'SC_Client' : 'await providerToUse.accounts()[accountIndex]'}, 0n, ${mode == 'web3' ? 'process.env.NODE_RPC' : 'providerToUse.getNodesUrls[0]'});
  }

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
  async ${protoFile.funcName}(${args}): Promise<OperationOutputs> {
    ${checkUnsignedArgs}

    ${argsSerialization}

    // Send the operation to the blockchain and retrieve its outputs
    return (
      await extractOutputsAndEvents(
        '${contractAddress}',
        '${protoFile.funcName}',
        serializedArgs,
        this.coins,
        '${returnType[protoFile.resType]}',
        this.account,
        this.nodeRPC,
      )
    );
  }

  /**
   * This method have been generated by the Massa Proto CLI.
   * It allows you to update the amount of Massa coins to send to the block creator when calling the Smart Contract.
   */
  editCoins(coins: bigint) {
    this.coins = coins;
  }
}

`;
    // save content to file
    const fileName = `${protoFile.funcName}Caller.ts`;
    if (outputPath.slice(-1) != '/') {
        outputPath += '/';
    }
    (0, fs_1.writeFileSync)(`${outputPath}${fileName}`, content, 'utf8');
    // add some functions and interfaces to the helper file
    // check if the helper file exists in the outputPath
    if (outputPath.slice(-1) != '/' || outputPath.slice(-1) != '\\') {
        outputPath += '/';
    }
    ;
    if ((0, fs_1.existsSync)(`${outputPath}${protoFile.funcName}Helper.ts`)) {
        // read the helper file
        let helperFile = (0, fs_1.readFileSync)(`${outputPath}${protoFile.funcName}Helper.ts`, 'utf8');
        // add the interfaces and functions
        helperFile += `


/*****************GENERATED BY MASSA-PROTO-CLI*****************/

import {
  OperationOutputs,
} from "./${protoFile.funcName}Caller";
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
  time,${mode == 'web3' ? `SmartContractsClient,
  ICallData,\n` : ''}
} from "@massalabs/massa-web3";
${mode == 'wallet' ? 'import { IAccount, providers } from "@massalabs/wallet-provider";\n' : ''}
export const MASSA_EXEC_ERROR = 'massa_execution_error';
export const OUTPUTS_PREFIX = 'Result${protoFile.funcName}:';

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

export async function extractOutputsAndEvents(
  contractAddress: string, 
  functionName: string, 
  args: Uint8Array, 
  coins: bigint, 
  returnType: string,
  account: ${mode == 'web3' ? 'SmartContractsClient' : 'IAccount'},
  nodeUrl: string,
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
    return {
      events: events,
    } as OperationOutputs;
  }
  if(rawOutput === null && returnType === 'void') {
    return {
      events: events,
    } as OperationOutputs;
  }
  if(rawOutput !== null && returnType !== 'void') {
    // try to deserialize the outputs
    let output: Uint8Array = new Uint8Array(0);
    let deserializedOutput = null; 
    try{
      output = rawOutput.slice(1,-1).split(',').map(
        (s) => parseInt(s)
      ) as unknown as Uint8Array;
      deserializedOutput = ${protoFile.funcName}Helper.fromBinary(output);
    }
    catch (err) {
      return {
        events: events,
      } as OperationOutputs;
    }
    return {
      outputs: output,
      events: events,
    } as OperationOutputs;
  }
  return {
    events: events,
  } as OperationOutputs; 
}

/**
 * This method have been generated by the Massa Proto CLI. 
 * It sets up all the objects needed to poll the events generated by the "${protoFile.funcName}" function.
 *
 * @param {TransactionDetails} txDetails - An object containing the operationId of SC call.
 * @param {string} nodeUrl - The url of the node to connect to.
 * 
 * @returns {Promise<EventPollerResult>} An object containing the eventPoller and the events.
 */
async function getEvents(txDetails: TransactionDetails, nodeUrl: string): Promise<IEvent[]>{
  const opId = txDetails.operationId;

  // setup the providers
  const providerPub: IProvider = {
    url: nodeUrl,
    type: ProviderType.PUBLIC,
  };
  const providerPriv: IProvider = {
    url: nodeUrl,
    type: ProviderType.PRIVATE,
  }; // we don't need it here but a private provider is required by the BaseClient object

  // setup the client config
  const clientConfig: IClientConfig = {
    providers: [providerPub, providerPriv],
    periodOffset: null,
  };
  // setup the client
  const client = new Client(clientConfig);

  // async poll events in the background for the given opId
  const { isError, eventPoller, events }: EventPollerResult =
    await time.withTimeoutRejection<EventPollerResult>(
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
        // save the helper file
        (0, fs_1.writeFileSync)(`${outputPath}${protoFile.funcName}Helper.ts`, "\n/*****************GENERATED BY PROTOC*****************/\n\n"
            + helperFile, 'utf8');
    }
    console.log(`Caller file: ${fileName} generated at: ${outputPath}`);
}
exports.generateTSCaller = generateTSCaller;
/**
 * Convert the given path to a relative path based on the current terminal path.
 *
 * @param absolutePath - The absolute path to convert.
 *
 * @returns The relative path based on the current terminal path.
 */
function convertToRelativePath(absolutePath) {
    return (0, path_1.relative)(process.cwd(), absolutePath);
}
/**
 * Convert the given path to an absolute path.
 *
 * @param givenPath - The path to convert.
 *
 * @returns The absolute path.
 */
function convertToAbsolutePath(givenPath) {
    if (givenPath.startsWith('.')) {
        return (0, path_1.resolve)(givenPath);
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
function generateTsCallers(protoFiles, outputDirectory, providerUrl, address, mode) {
    for (const file of protoFiles) {
        if (!file.protoPath)
            throw new Error('Error: protoPath is undefined.');
        // generate the helper and the caller inside the same folder
        generateTSCaller(outputDirectory, file, address, mode);
    }
}
exports.generateTsCallers = generateTsCallers;
//# sourceMappingURL=ts-gen.js.map