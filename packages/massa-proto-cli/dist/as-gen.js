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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAsCallers = exports.generateAsCall = void 0;
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const asProtoTypes = __importStar(require("./asProtoTypes.json"));
/**
 * Creates a contract function caller with the given proto file and address.
 *
 * @param protoData - the proto file containing the information to call the contract's function
 * @param address - the address of the contract containing the function to call
 * @param outputDirectory - the output directory to create the file for the caller
 */
function generateAsCall(protoData, address, outputDirectory) {
    // check if all the arguments are supported (to avoid 'undefined' objects in the generated code)
    protoData.argFields.forEach(({ type }) => {
        if (!asProtoTypes[type]) {
            throw new Error(`Unsupported type: ${type}`);
        }
    });
    // generating AS arguments
    let args = [];
    protoData.argFields.forEach(({ name, type }) => args.push(`${name}: ${asProtoTypes[type]}`));
    let responseDecoding = '';
    let responseTypeImports = '';
    if (protoData.resType !== null) {
        responseTypeImports += `
import { decode${protoData.funcName}RHelper } from './${protoData.funcName}RHelper';`;
        responseDecoding = `

  // Convert the result to the expected response type
  const response = decode${protoData.funcName}RHelper(Uint8Array.wrap(changetype<ArrayBuffer>(result)));

  return response.value;`;
    }
    ;
    // generating the content of the file
    // eslint-disable-next-line max-len
    const content = `import { encode${protoData.funcName}Helper, ${protoData.funcName}Helper } from './${protoData.funcName}Helper';${responseTypeImports}
import { call, Address } from "@massalabs/massa-as-sdk";
import { Args } from '@massalabs/as-types';

export function ${protoData.funcName}(${args.length > 0 ? args.join(', ') + ', ' : ''} coins: u64): ${protoData.resType !== null ? asProtoTypes[protoData.resType] : 'void'} {

  const result = call(
    new Address("${address}"),
    "${protoData.funcName}",
    new Args(changetype<StaticArray<u8>>(encode${protoData.funcName}Helper(new ${protoData.funcName}Helper(
      ${protoData.argFields.map(({ name, type }) => name).join(',\n\t\t')}
    )))),
    coins
  );${responseDecoding}
}
`;
    // Save the content to a ts file
    (0, fs_1.writeFileSync)(path_1.default.join(outputDirectory, `${protoData.funcName}Caller.ts`), content);
}
exports.generateAsCall = generateAsCall;
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
        `--proto_path=${outputDirectory}`,
        `${outputDirectory}${protoData.funcName}.proto`
    ]);
    if (protocProcess.status !== 0) {
        throw new Error(`Failed to generate AS helpers code for ${protoData} with error: ${protocProcess.stderr}`);
    }
}
/**
 * Creates assembly script sc callers with the given protobuf files.
 *
 * @param protoFiles - the array of proto files data
 * @param address - the address of the contract where the proto files are coming from
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