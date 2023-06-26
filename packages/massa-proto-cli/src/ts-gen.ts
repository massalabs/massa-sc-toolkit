import { ProtoFile } from './protobuf';
import { writeFileSync } from 'fs';
import { execSync } from 'child_process';
import * as returnType from './protoTypes.json';
import { resolve } from 'path';

/**
 * Compile protofile to TypeScript helper class.
 *
 * @remarks
 * - If the @see protoFilePath is the relative path, it should be based on the location of your terminal
 * 
 * @param protoFilePath - The path to the proto file.
 */
export function compileProtoToTSHelper(
  protoFilePath: string,
): void {
  // if the 

  execSync(`npx protoc --ts_out="." ${protoFilePath}`, { stdio: 'inherit' });
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
 * @param protoFile - The protofile object.
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
    .map((arg) => ` * @param {${arg.type}} ${arg.name} - `)
    .join('\n');
}

/**
 * Generate a TypeScript file to allow the user to easily call a function of a Smart Contract
 *
 * @remarks
 * - If the @see helperFilePath is the relative path based on the .proto file path
 * - If the @see outputPath is the relative path based on the location of your terminal
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
  try {
    compileProtoToTSHelper(protoFile.protoPath);
  } catch (e) {
    throw new Error('Error while generating the helper file: ' + e);
  }
  
  // get the absolute path of the previously generated helper file
  const helperAbsolutePath = convertPathToAbsolute(protoFile.protoPath).replace(/\.proto$/, '.ts');

  // Get the new location for the helper file (it should be in the same folder as the caller file)
  let newLocation = convertPathToAbsolute(outputPath);

  // New location = absolute_outputPath + protoFile.funcName + 'Helper.ts'
  // we also rename the helper file to match the function name + 'Helper.ts'
  if(!newLocation.endsWith('/') && !newLocation.endsWith('\\')) {
    newLocation += '/' + protoFile.funcName + 'Helper.ts';
  } else{
    newLocation += protoFile.funcName + 'Helper.ts';
  }

  execSync(`move "${helperAbsolutePath}" "${newLocation}"`, { stdio: 'inherit' });

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

export interface TransactionDetails {
  operationId: string;
}

/**
 * This method have been generated by the Massa Proto CLI.
 * It allows you to call the "${protoFile.funcName}" function of the 
 * "${contractAddress}" Smart Contract.
 * 
 ${documentationArgs.slice(1)}
 *
 * @returns {${protoFile.resType}} The result of the "${protoFile.funcName}" function.
 */
 export async function ${protoFile.funcName}(${args}): Promise<${protoFile.resType}> {
  ${checkUnsignedArgs}

  ${argsSerialization}

  // Send the operation to the blockchain and retrieve its ID
  const opId = await callSC("${contractAddress}", "${protoFile.funcName}", serializedArgs, coins);

  // Retrieve the events and outPuts from the operation ID
  // TODO: Retrieve the events and outPuts from the operation ID
  const outputData = await getOutput(opId);

  return outputData;
}
`;

  // save content to file
  const fileName = `${protoFile.funcName}Caller.ts`;
  if (outputPath.slice(-1) != '/') {
    outputPath += '/';
  }
  writeFileSync(`${outputPath}${fileName}`, content, 'utf8');
  console.log(`Caller file: ${fileName} generated at: ${outputPath}`);
}


function convertPathToAbsolute(givenPath: string): string {
  if (givenPath.startsWith('.')) {
    return resolve(givenPath);
  }
  return givenPath;
}
