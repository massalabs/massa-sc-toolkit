import { ProtoFile } from './protobuf';
import { writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import * as returnType from './tsProtoTypes.json';
import { resolve, relative, join } from 'path';


/**
 * Compile proto file to TypeScript helper class.
 *
 * @remarks
 * - The ts helper file is generated in the folder 'helpers' at the same location as your current terminal.
 * - If the @see protoFilePath is the relative path, it should be based on the location of your terminal
 * 
 * @param protoFilePath - The path to the proto file.
 */
export function compileProtoToTSHelper(
  protoFilePath: string,
): void {

  // Compile the proto file to a ts file
  // If 'protoFilePath' is absolute, then 'npx protoc' will not work. We need to convert it to relative path
  try{
    execSync(`npx protoc --ts_out="./helpers" --proto_path helpers "${convertToRelativePath(protoFilePath)}"`);
  } catch (e) {
    throw new Error(
      'Error while compiling the proto file: ' + e +
      '\nIs the proto file in a sub folder of the current terminal location?'
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
    .reduce(
      (content, arg) => {
        if (!returnType[arg.type]) throw new Error(`Unsupported type: ${arg.type}`);
        return `${content}${arg.name}: ${returnType[arg.type]}, `;
      },'') + 'coins: bigint';
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
    .map((arg) => `\tif (${arg.name} < 0) throw new Error("Invalid argument: ${arg.name} cannot be negative according to protobuf file.");`);

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
function argumentSerialization(protoFile: ProtoFile): string {
  const args = protoFile.argFields
    .map((arg) => `${arg.name}: ${arg.name}`)
    .join(',\n    ');

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
function generateDocArgs(protoFile: ProtoFile): string {
  return protoFile.argFields
    .map((arg) => ` * @param {${returnType[arg.type]}} ${arg.name} - `)
    .join('\n');
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
export function generateTSCaller(
  outputPath: string,
  protoFile: ProtoFile,
  contractAddress?: string,
): void {
  // generate the helper file using protoc. Throws an error if the command fails.

  // protoPath is mandatory to generate the helper file
  if(!protoFile.protoPath) throw new Error('Error: protoPath is undefined.'); 
  try {
    compileProtoToTSHelper(protoFile.protoPath);
  } catch (e) {
    throw new Error('Error while generating the helper file: ' + e);
  }
  
  // Get the new location for the helper file (it should be in the same folder as the caller file)
  let newLocation = convertToAbsolutePath(outputPath);

  // New location and renaming = absolute_outputPath + protoFile.funcName + 'Helper.ts'
  if(!newLocation.endsWith('/') && !newLocation.endsWith('\\')) {
    newLocation += '/' + protoFile.funcName + 'Helper.ts';
  } else{
    newLocation += protoFile.funcName + 'Helper.ts';
  }


  const helperPath = protoFile.protoPath.replace('.proto', '.ts');
  // join "./helpers/" and helperPath
  const startPath = join(helperPath);

  // check the os to use the correct command to rename the helper file
  if (process.platform === 'win32') {
    execSync(`move "${helperPath}" "${newLocation}"`);
  } else {
    execSync(`mv "${helperPath}" "${newLocation}"`);
  }

  // generate the arguments
  const args = setupArguments(protoFile);

  // generate the documentation
  if (!contractAddress) {
    contractAddress = 'Paste your contract address here';
  }
  const documentationArgs = generateDocArgs(protoFile);

  // verify that the given arguments are valid
  const checkUnsignedArgs = generateUnsignedArgCheckCode(protoFile);

  // generate the caller function body
  const argsSerialization = argumentSerialization(protoFile);

  // generate the caller function
  const content = `import { ${protoFile.funcName}Helper } from "./${protoFile.funcName}Helper";
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
  time, 
} from "@massalabs/massa-web3";

export interface TransactionDetails {
  operationId: string;
}

export interface IEventPollerResult {
  isError: boolean;
  eventPoller: EventPoller;
  events: IEvent[];
}

const MASSA_EXEC_ERROR = 'massa_execution_error';


/** The following global variable and the next class should be in a dedicated file. */
let callSC: (address: string, funcName: string, binArguments: Uint8Array, maxCoin: bigint) => Promise<TransactionDetails>;


/**
 * This method have been generated by the Massa Proto CLI.
 * It allows you to call the "${protoFile.funcName}" function of the 
 * "${contractAddress}" Smart Contract.
 * 
 * @remarks
 * To work properly, you need to run 'npm install @protobuf-ts/plugin' in your project folder.
 * Otherwise, this caller will not work.
 * 
 ${documentationArgs.slice(1)}
 *
 * @returns {IEvent[]} A promise that resolves to an array of events generated during the execution of ${protoFile.funcName}.
 */
 export async function ${protoFile.funcName}(${args}): Promise<IEvent[]> {
  ${checkUnsignedArgs}

  ${argsSerialization}

  // Send the operation to the blockchain and retrieve its outputs
  return (
    await getEvents(
      await callSC(
        '${contractAddress}',
        '${protoFile.funcName}',
        serializedArgs,
        coins,
      ) as TransactionDetails
    )
  );
}

/**
 * This method have been generated by the Massa Proto CLI. 
 * It sets up all the objects needed to poll the events generated by the "${protoFile.funcName}" function.
 * 
 * @param {TransactionDetails} txDetails - An object containing the operationId of SC call.
 * 
 * @returns {Promise<IEventPollerResult>} An object containing the eventPoller and the events.
 */
async function getEvents(txDetails: TransactionDetails): Promise<IEvent[]>{
  const opId = txDetails.operationId;

  // setup the providers
  const providerPub: IProvider = {
    url: 'https://buildnet.massa.net/api/v2',
    type: ProviderType.PUBLIC,
  };
  const providerPriv: IProvider = {
    url: 'https://buildnet.massa.net/api/v2',
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
      'Massa Deployment Error: ' + JSON.stringify(events, null, 4),
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
 * @returns A promise that resolves to an 'IEventPollerResult' which contains the results or an error
 *
 */
const pollAsyncEvents = async (
  web3Client: Client,
  opId: string,
): Promise<IEventPollerResult> => {
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
        } as IEventPollerResult);
      }

      if (events.length > 0) {
        return resolve({
          isError: false,
          eventPoller,
          events,
        } as IEventPollerResult);
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
  const fileName = `${protoFile.funcName}Caller.ts`;
  if (outputPath.slice(-1) != '/') {
    outputPath += '/';
  }
  writeFileSync(`${outputPath}${fileName}`, content, 'utf8');
  console.log(`Caller file: ${fileName} generated at: ${outputPath}`);
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
  address?: string | undefined,
) {
  for (const file of protoFiles) {
    if(!file.protoPath) throw new Error('Error: protoPath is undefined.');
    // generate the helper and the caller inside the same folder
    generateTSCaller(outputDirectory, file, address);
  }
}