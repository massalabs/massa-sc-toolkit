import { load } from 'protobufjs';
import * as fs from 'fs';

export const tempProtoFilePath = './build/';

/**
 * Represents a function in a proto file
 *
 * @see argFields - the arguments of the function as an array of IFunctionArguments
 * @see funcName - the name of the function
 * @see resType - the return type of the function
 * @see protoData - the .proto file content (optional)
 * @see protoPath - The path to the protofile to generate the caller (optional)
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
 * @param protoFilePath - the path to the proto file
 * @returns The ProtoFile containing the function, its arguments name, arguments type and its return type
 */
export async function getProtoFunction(
  protoFilePath: string,
): Promise<ProtoFile> {
  // load the proto file
  const protoContent = await load(protoFilePath);
  // convert protoContent to JSON
  const protoJSON = protoContent.toJSON();

  const messageNames = Object.keys(protoJSON.nested);

  // check if the proto file contains 2 messages
  if (messageNames.length != 2) {
    throw new Error('Error: the protoFile should contain 2 messages.');
  }

  // get the Helper message
  const helperName = protoJSON.nested[messageNames[0]];
  // get the arguments of the Helper
  let argFields: FunctionArguments[] = [];
  for (const arg in helperName[`fields`]) {
    if (helperName[`fields`][arg]) {
      const name: string = arg;
      const type: string = helperName[`fields`][arg].type;
      argFields.push({ name, type });
    }
  }
  // get the RHelper message
  const rHelperName = protoJSON.nested[messageNames[1]];
  // get the return type from the RHelper
  const keys = Object.keys(rHelperName[`fields`]);
  let returnType = 'void';
  if (keys.length == 1) {
    returnType = rHelperName[`fields`][keys[0]].type;
  }

  const funcName = messageNames[0].replace(/Helper$/, '');
  // get the content of the .proto file
  let protoFileContent = '';
  fs.readFile(protoFilePath, 'utf8', (error, data) => {
    if (error) {
      console.error('Error reading the protoFile:', error);
      return;
    }
    protoFileContent = data;
  });

  return {
    argFields,
    funcName: funcName,
    resType: returnType,
    protoData: protoFileContent,
    protoPath: protoFilePath,
  };
}
