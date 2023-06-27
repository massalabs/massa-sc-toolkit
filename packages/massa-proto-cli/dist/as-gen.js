"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAsCallers = void 0;
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
/**
 * Converts the given protobuf type to the related assembly script type.
 *
 * @param type - the protobuf type
 *
 * @returns the assembly script type
 */
function convertTypeToAS(type) {
    switch (type) {
        case 'bool':
            return 'bool';
        case 'int32':
            return 'i32';
        case 'int64':
            return 'i64';
        case 'uint32':
            return 'u32';
        case 'uint64':
            return 'u64';
        case 'float':
            return 'f32';
        case 'double':
            return 'f64';
        case 'string':
            return 'string';
        default:
            throw new Error(`Unsupported type: ${type}`);
    }
}
/**
 * Creates imports for the caller file generated by {@link generateAsCall}
 *
 * @param protoData - the proto file data
 *
 * @returns the multiline import statements as a string
 */
function generateAsImports(protoData) {
    let responseTypeImports = "";
    if (protoData.resType !== null) {
        responseTypeImports = `import { decode${protoData.funcName}RHelper, ${protoData.funcName}RHelper };
    from './${protoData.funcName}RHelper';`;
    }
    return `import { encode${protoData.funcName}Helper, ${protoData.funcName}Helper };
  from './${protoData.funcName}Helper';
  ${responseTypeImports}

  import { call } from "@massalabs/massa-as-sdk";`;
}
/**
 * Creates a contract function caller with the given proto file and address.
 *
 * @param protoData - the proto file containing the informations to call the contract's function
 * @param address - the address of the contract containing the function to call
 * @param outputDirectory - the output directory to create the file for the caller
 */
function generateAsCall(protoData, address, outputDirectory) {
    // generating AS arguments
    let args = [];
    protoData.argFields.forEach(({ name, type }) => args.push(`${name}: ${convertTypeToAS(type)}`));
    // Generate function signature
    const functionSignature = `export function ${protoData.funcName}(${args.length > 0 ? args.join(', ') + ', ' : ""} coins: number): ${protoData.resType !== null ? protoData.resType : 'void'}`;
    // Generate function body
    const functionBody = `const result = call(
    "${address}",
    "${protoData.funcName}",
    changetype<StaticArray<u8>>(encode${protoData.funcName}Helper(new ${protoData.funcName}Helper(${args.join(', ')}))),
    coins);`;
    let responseDecoding = "";
    if (protoData.resType !== null) {
        responseDecoding = `const response = decode${protoData.funcName}RHelper(Uint8Array.wrap(changeType<ArrayBuffer>(result)));

  return response.value;`;
        // Compose the full function
        const fullFunction = `${functionSignature} {
  ${functionBody}

  ${responseDecoding}
}`;
        // Write to file
        (0, fs_1.writeFileSync)(path_1.default.join(outputDirectory, `${protoData.funcName}.ts`), generateAsImports(protoData) + fullFunction);
    }
}
/**
 * Creates the assembly script helper for serializing and deserializing with the given protobuf file.
 *
 * @param protoData - the proto file data.
 * @param outputDirectory - the directory where to generate such helpers.
 */
function generateProtocAsHelper(protoData, outputDirectory) {
    let protocProcess = (0, child_process_1.spawnSync)('protoc', [
        `--plugin=protoc-gen-as=./node_modules/.bin/as-proto-gen`,
        `--as_out=${outputDirectory}`,
        `--as_opt=gen-helper-methods`,
        `--proto_path=./build`,
        protoData.protoData,
    ]);
    if (protocProcess.status !== 0) {
        throw new Error(`Failed to generate AS helpers code for ${protoData} with error: ${protocProcess.stderr}`);
    }
}
/**
 * Creates assembly script sc callers with the given protobuf files.
 *
 * @param protoFiles - the array of proto files data
 * @param address - the address of the contract where the proto files are comming from
 * @param outputDirectory - the output directory where to generates the callers
 */
function generateAsCallers(protoFiles, address, outputDirectory) {
    for (const file of protoFiles) {
        generateProtocAsHelper(file, outputDirectory);
        generateAsCall(file, address, outputDirectory);
    }
}
exports.generateAsCallers = generateAsCallers;
//# sourceMappingURL=as-gen.js.map