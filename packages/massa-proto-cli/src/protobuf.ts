import {
  MASSA_PROTOFILE_KEY,
  PROTO_FILE_SEPARATOR,
  strToBytes,
} from '@massalabs/massa-web3';
import { bytesArrayToString } from './utils/bytesArrayToString';
import { promises as fs, writeFileSync } from 'fs';
import { MassaProtoFile } from './MassaProtoFile';
import { load, IType } from 'protobufjs';
import path from 'path';

/**
 * Represents a function in a proto file
 *
 * @see argFields - the arguments of the function as an array of IFunctionArguments
 * @see funcName - the name of the function
 * @see resType - the return type of the function
 * @see protoData - the .proto file content (optional)
 * @see protoPath - The relative path to the proto file to generate the caller (optional)
 */
export interface ProtoFile {
  argFields: FunctionArguments[];
  funcName: string;
  resType: string;
  protoData?: string;
  protoPath?: string;
}

/**
 * Represents an argument of a function
 *
 * @see name - the name of the argument
 * @see type - the type of the argument
 */
export interface FunctionArguments {
  name: string;
  type: string;
}

/**
 * Retrieve all the function's data and return them as an ProtoFile
 *
 * @param protoPath - the path to the proto file
 *
 * @returns The ProtoFile containing the function, its arguments name, arguments type and its return type
 */
export async function getProtoFunction(protoPath: string): Promise<ProtoFile> {
  const protoContent = await load(protoPath);
  const protoJSON = protoContent.toJSON();

  // protoJSON.nested shouldn't be undefined
  if (!protoJSON.nested)
    throw new Error(
      'Error: nested is undefined. Please check your proto file.',
    );

  const messageNames = Object.keys(protoJSON.nested);

  // check if the proto file contains 2 messages
  if (messageNames.length > 2) {
    throw new Error('Error: the protoFile should contain maximum 2 messages.');
  }

  // get the Helper message
  const helper = protoJSON.nested[messageNames[0]] as IType;
  // get the arguments of the Helper
  const argFields: FunctionArguments[] = Object.entries(helper.fields)
    .filter(([, value]) => value)
    .map(([name, field]) => ({
      name,
      type: (field as { type: string; id: number }).type,
    }));
  const rHelper = protoJSON.nested[messageNames[1]] as IType;
  let resType: string;
  // if the rHelper.fields exists, get the return type
  try {
    const rHelperKeys = Object.keys(rHelper.fields);
    resType =
      rHelperKeys.length === 1 ? rHelper.fields[rHelperKeys[0]].type : 'void';
  }
  catch (e){
    resType = 'void';
  }


  const funcName = messageNames[0].replace(/Helper$/, '');
  const protoData = await fs.readFile(protoPath, 'utf8').catch((error) => {
    throw new Error('Error while reading the proto file: ' + error);
  });

  return { argFields, funcName, resType, protoData, protoPath };
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
  let response = null;
  try {
    response = await fetch(providerUrl, {
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
        writeFileSync(filepath, proto);
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
    console.error(msg, ex);
    throw ex;
  }
}
