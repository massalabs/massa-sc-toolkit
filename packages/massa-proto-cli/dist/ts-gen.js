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
 * - The ts helper file is generated in the folder 'proto_build' at the same location as your current terminal.
 * - If the @see protoFilePath is the relative path, it should be based on the location of your terminal
 *
 * @param protoFilePath - The path to the proto file.
 */
function compileProtoToTSHelper(protoFilePath) {
    // check if the 'proto_build' folder exists. If not, create it.
    if (!(0, fs_1.existsSync)('proto_build')) {
        (0, child_process_1.execSync)('mkdir proto_build');
    }
    // Compile the proto file to a ts file
    // If 'protoFilePath' is absolute, then 'npx protoc' will not work. We need to convert it to relative path
    try {
        (0, child_process_1.execSync)(`npx protoc --ts_out="./proto_build" "${convertToRelativePath(protoFilePath)}"`);
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
    }, '') + 'coins: bigint';
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
function argumentSerialization(protoFile) {
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
function generateDocArgs(protoFile) {
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
function generateTSCaller(outputPath, protoFile, contractAddress) {
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
    // join "./proto_build/" and helperPath
    const startPath = (0, path_1.join)('proto_build/', helperPath);
    // check the os to use the correct command
    if (process.platform === 'win32') {
        (0, child_process_1.execSync)(`move "${startPath}" "${newLocation}"`);
    }
    else {
        (0, child_process_1.execSync)(`mv "${startPath}" "${newLocation}"`);
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

export interface TransactionDetails {
  operationId: string;
}

/** The following global variable and the next class should be in a dedicated file. */
let callSC: (address: string, funcName: string, binArguments: Uint8Array, maxCoin: bigint) => Promise<TransactionDetails>;

/**
 * A class to call the blockchain.
 */
export class BlockchainCaller {
  /**
   * Constructor for the BlockchainCaller class.
   *
   * @param {Function} caller - The function to call the blockchain.
   */
  constructor(
    caller: (
      address: string,
      funcName: string,
      binArguments: Uint8Array,
      maxCoin: bigint
    ) => Promise<TransactionDetails>
  ) {
    if (!caller) {
      throw new Error('A caller function must be provided');
    }
    callSC = caller;
  }
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
 ${documentationArgs.slice(1)}
 *
 * @returns {${protoFile.resType}} The result of the "${protoFile.funcName}" function.
 */
 export async function ${protoFile.funcName}(${args}): Promise<${returnType[protoFile.resType]}> {
  ${checkUnsignedArgs}

  ${argsSerialization}

  // Send the operation to the blockchain and retrieve its outputs
  return await callSC(
    '${contractAddress}',
    '${protoFile.funcName}',
    serializedArgs,
    coins,
  );
}
`;
    // save content to file
    const fileName = `${protoFile.funcName}Caller.ts`;
    if (outputPath.slice(-1) != '/') {
        outputPath += '/';
    }
    (0, fs_1.writeFileSync)(`${outputPath}${fileName}`, content, 'utf8');
    console.log(`Caller file: ${fileName} generated at: ${outputPath}`);
    // delete the proto_build folder and its content if it exists
    if ((0, fs_1.existsSync)('proto_build') && process.platform === 'win32') {
        (0, child_process_1.execSync)('rmdir /s /q proto_build');
    }
    else if ((0, fs_1.existsSync)('proto_build')) {
        (0, child_process_1.execSync)('rm -r proto_build');
    }
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
function generateTsCallers(protoFiles, outputDirectory, address) {
    for (const file of protoFiles) {
        if (!file.protoPath)
            throw new Error('Error: protoPath is undefined.');
        // generate the helper and the caller inside the same folder
        generateTSCaller(outputDirectory, file, address);
    }
}
exports.generateTsCallers = generateTsCallers;
//# sourceMappingURL=ts-gen.js.map