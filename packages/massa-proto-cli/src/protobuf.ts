import {
  MASSA_PROTOFILE_KEY,
  PROTO_FILE_SEPARATOR,
  strToBytes,
} from '@massalabs/massa-web3';
import { ProtoType } from '@massalabs/as-transformer';
import { bytesArrayToString } from './utils/bytesArrayToString.js';
import * as fs from 'fs';
import { MassaProtoFile } from './MassaProtoFile.js';
import { IType } from 'protobufjs';
import pkg from 'protobufjs';
const { load } = pkg;
import path from 'path';
import { descriptoContent } from './utils/descriptorContent.js';
import { mkdirpSync } from 'mkdirp';
import assert from 'assert';

/**
 * Represents a function in a proto file
 *
 * @see argFields - the arguments of the function as an array of IFunctionArgument
 * @see funcName - the name of the function
 * @see resType - the return type of the function
 * @see protoData - the .proto file content (optional)
 * @see protoPath - The relative path to the proto file to generate the caller (optional)
 */
export interface ProtoFile {
  argFields: FunctionArgument[];
  funcName: string;
  resType: FunctionArgument;
  protoData?: string;
  protoPath?: string;
}

/**
 * Represents an argument of a function
 *
 * @remarks
 * If the argument is a custom type, the @see ctype field will be filled with the custom type
 * and @see type will be filled with the type used to represent the custom type (e.g. bytes)
 *
 * @see name - the name of the argument
 * @see type - the type of the argument
 */
export interface FunctionArgument {
  name: string;
  type: ProtoType;
}

/**
 * Retrieve all the function's data and return them as an ProtoFile
 *
 * @param protoPath - the path to the proto file
 *
 * @returns The ProtoFile containing the function, its arguments name, arguments type and its return type
 */
export async function getProtoFunction(
  protoPath: string,
  customs: Map<string, ProtoType>,
): Promise<ProtoFile> {
  // check if the protofile exists contains 'import "google/protobuf/descriptor.proto";'
  const descriptorProtoPath = path.join(
    path.dirname(protoPath),
    'google/protobuf/descriptor.proto',
  );

  if (!fs.existsSync(descriptorProtoPath)) {
    const protoFileContent = await fs.promises.readFile(protoPath, 'utf8');
    const regex = /import "google\/protobuf\/descriptor.proto";/g;
    if (regex.test(protoFileContent)) {
      mkdirpSync(path.join(path.dirname(protoPath), 'google/protobuf'));
      fs.writeFileSync(descriptorProtoPath, descriptoContent);
    }
  }

  const protoContent = await load(protoPath);
  const protoJSON = protoContent.toJSON();

  // protoJSON.nested shouldn't be undefined
  if (!protoJSON.nested)
    throw new Error(
      'Error: nested is undefined. Please check your proto file.',
    );

  const messageNames = Object.keys(protoJSON.nested);

  const funcName = path.basename(protoPath, '.proto');

  const helperName: string | undefined = messageNames.includes(
    funcName + 'Helper',
  )
    ? funcName + 'Helper'
    : undefined;

  const rHelperName: string | undefined = messageNames.includes(
    funcName + 'RHelper',
  )
    ? funcName + 'RHelper'
    : undefined;

  const argFields = getArgFields();

  const resType = getResType();

  const protoData = await fs.promises
    .readFile(protoPath, 'utf8')
    .catch((error) => {
      throw new Error('Error while reading the proto file: ' + error);
    });

  return { argFields, funcName, resType, protoData, protoPath };

  // --- helper functions ---
  // get the arguments of the function if any
  function getArgFields(): FunctionArgument[] {
    if (!helperName || !protoJSON.nested) {
      return [];
    }

    const helper = protoJSON.nested[helperName] as IType | undefined;
    if (!helper || !helper.fields) {
      return [];
    }

    // get the arguments of the Helper
    return Object.entries(helper.fields)
      .filter(([, value]) => value)
      .map(([name, field]) => {
        const fieldRule =
          (field as { rule: string; type: string; id: number }).rule ===
            'repeated'
            ? true
            : false;

        if (field.options) {
          const type = field.options['(custom_type)'];
          const metaData = customs.get(type)?.metaData;
          return {
            name: name,
            type: {
              name: type,
              repeated: fieldRule,
              metaData: metaData,
            } as ProtoType,
          } as FunctionArgument;
        } else {
          throw new Error('(custom_type) not specified for ' + name);
        }
      });
  }

  // get the return type of the function if any or void
  function getResType(): FunctionArgument {
    if (rHelperName && protoJSON.nested) {
      const rHelper = protoJSON.nested[rHelperName] as IType;
      if (rHelper && rHelper.fields) {
        const rHelperKeys = Object.keys(rHelper.fields);

        if (rHelperKeys.length === 1) {
          const key = rHelperKeys[0];
          assert(key);
          const field = rHelper.fields[key];
          assert(field);

          if (field.options) {
            const type = field.options['(custom_type)'];
            const metaData = customs.get(type)?.metaData;
            return {
              name: 'value',
              type: {
                name: type,
                repeated: (field.rule ? true : false),
                metaData: metaData,
              } as ProtoType,
            } as FunctionArgument;
          } else {
            throw new Error('(custom_type) not specified for the return value');
          }
        }
      }
    }
    return {
      name: 'void',
      type: {
        name: 'void',
      } as ProtoType,
    } as FunctionArgument;
  }
}

/**
 * Get the proto file of the contracts from the Massa Blockchain.
 *
 * @param contractAddresses - An array of contract addresses (as strings)
 *
 * @returns A promise that resolves to the array of IProtoFiles corresponding
 * to the proto file associated with each contract or the values are null if the file is unavailable.
 */
export async function getProtoFiles(
  contractAddresses: string[],
  outputDirectory: string,
  providerUrl: string,
): Promise<MassaProtoFile[]> {
  // prepare request body
  const requestProtoFiles: object[] = [];
  for (let address of contractAddresses) {
    requestProtoFiles.push({
      address: address,
      key: Array.from(strToBytes(MASSA_PROTOFILE_KEY)),
    });
  }
  const body = {
    jsonrpc: '2.0',
    method: 'get_datastore_entries',
    params: [requestProtoFiles],
    id: 1,
  };

  // send request
  try {
    const response = await fetch(providerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    // parse response
    const json = await response.json();
    let protoFiles: MassaProtoFile[] = [];

    // for each contract, get the proto files
    for (let contract of json.result) {
      if (!contract.final_value) {
        throw new Error('No proto file found');
      }

      const retrievedProtoFiles = bytesArrayToString(contract.final_value); // converting the Uint8Array to string
      // splitting all the proto functions to make separate proto file for each functions
      const protos = retrievedProtoFiles.split(PROTO_FILE_SEPARATOR);
      // for proto file, save it and get the function name
      for (let protoContent of protos) {
        // remove all the text before the first appearance of the 'syntax' keyword
        const proto = protoContent.substring(protoContent.indexOf('syntax'));

        // get the function name from the proto file
        const functionName = proto
          .substring(proto.indexOf('message '), proto.indexOf('Helper'))
          .replace('message ', '')
          .trim();
        // save the proto file
        const filepath = path.join(outputDirectory, functionName + '.proto');
        fs.writeFileSync(filepath, proto);
        const extractedProto: MassaProtoFile = {
          data: proto,
          filePath: filepath,
          protoFuncName: functionName,
        };
        protoFiles.push(extractedProto);
      }
    }
    return protoFiles;
  } catch (ex) {
    const msg = `Failed to retrieve the proto files.`;
    // eslint-disable-next-line no-console
    console.error(msg, ex);
    throw ex;
  }
}
