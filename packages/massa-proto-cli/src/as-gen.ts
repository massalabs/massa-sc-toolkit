import { writeFileSync } from 'fs';
import { spawnSync } from 'child_process';
import path from 'path';
import { ProtoFile } from './protobuf';
import * as asProtoTypes from './asProtoTypes.json';


/**
 * Creates a contract function caller with the given proto file and address.
 *
 * @param protoData - the proto file containing the information to call the contract's function
 * @param address - the address of the contract containing the function to call
 * @param outputDirectory - the output directory to create the file for the caller
 */
export function generateAsCall(
  protoData: ProtoFile,
  address: string,
  outputDirectory: string,
) {
  // check if all the arguments are supported (to avoid 'undefined' objects in the generated code)
  protoData.argFields.forEach(({ type }) => {
    if (!asProtoTypes[type]) {
      throw new Error(`Unsupported type: ${type}`);
    }
  });

  // generating AS arguments
  let args: string[] = [];
  protoData.argFields.forEach(({ name, type }) =>
    args.push(`${name}: ${asProtoTypes[type]}`),
  );

  let responseDecoding = '';
  let responseTypeImports = '';
  if (protoData.resType !== null) {
    responseTypeImports += `
import { decode${protoData.funcName}RHelper } from './${protoData.funcName}RHelper';`;

    responseDecoding = `

  // Convert the result to the expected response type
  const response = decode${protoData.funcName}RHelper(Uint8Array.wrap(changetype<ArrayBuffer>(result)));

  return response.value;`;
  };

  // generating the content of the file
  // eslint-disable-next-line max-len
  const content =`import { encode${protoData.funcName}Helper, ${protoData.funcName}Helper } from './${protoData.funcName}Helper';${responseTypeImports}
import { call, Address } from "@massalabs/massa-as-sdk";
import { Args } from '@massalabs/as-types';

export function ${protoData.funcName}(${
  args.length > 0 ? args.join(', ') + ', ' : ''
} coins: u64): ${protoData.resType !== null ? asProtoTypes[protoData.resType] : 'void'} {

  const result = call(
    new Address("${address}"),
    "${protoData.funcName}",
    new Args(changetype<StaticArray<u8>>(encode${protoData.funcName}Helper(new ${protoData.funcName}Helper(
      ${protoData.argFields.map(({name, type}) => name).join(',\n')}
    )))),
    coins
  );${responseDecoding}
}
`;

  // Save the content to a ts file
  writeFileSync(
    path.join(outputDirectory, `${protoData.funcName}Caller.ts`),
    content,
  );
}

/**
 * Creates the assembly script helper for serializing and deserializing with the given protobuf file.
 *
 * @param protoData - the proto file data.
 * @param outputDirectory - the directory where to generate such helpers.
 */
function generateProtocAsHelper(protoData: ProtoFile, outputDirectory: string) {
  let protocProcess = spawnSync('protoc', [
    `--plugin=protoc-gen-as=./node_modules/.bin/as-proto-gen`,
    `--as_out=${outputDirectory}`,
    `--as_opt=gen-helper-methods`,
    `--proto_path=${outputDirectory}`,
    `${outputDirectory}${protoData.funcName}.proto`
  ]);

  if (protocProcess.status !== 0) {
    throw new Error(
      `Failed to generate AS helpers code for ${protoData} with error: ${protocProcess.stderr}`,
    );
  }
}

/**
 * Creates assembly script sc callers with the given protobuf files.
 *
 * @param protoFiles - the array of proto files data
 * @param address - the address of the contract where the proto files are coming from
 * @param outputDirectory - the output directory where to generates the callers
 */
export function generateAsCallers(
  protoFiles: ProtoFile[],
  address: string,
  outputDirectory: string,
) {
  for (const file of protoFiles) {
    generateProtocAsHelper(file, outputDirectory);
    generateAsCall(file, address, outputDirectory);
  }
}
