import { load, IType } from 'protobufjs';
import { promises as fs } from 'fs';

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
 * @returns The ProtoFile containing the function, its arguments name, arguments type and its return type
 */
export async function getProtoFunction(protoPath: string): Promise<ProtoFile> {
  const protoContent = await load(protoPath);
  const protoJSON = protoContent.toJSON();
  const messageNames = Object.keys(protoJSON.nested);

  // check if the proto file contains 2 messages
  if (messageNames.length !== 2) {
    throw new Error('Error: the protoFile should contain 2 messages.');
  }

  // get the Helper message
  const helper = protoJSON.nested[messageNames[0]] as IType;
  // get the arguments of the Helper
  const argFields: FunctionArguments[] = Object.entries(helper.fields)
    .filter(([, value]) => value)
    .map(([name, field]) => ({ name, type: field.type }));

  const rHelper = protoJSON.nested[messageNames[1]] as IType;
  const rHelperKeys = Object.keys(rHelper.fields);
  const resType =
    rHelperKeys.length === 1 ? rHelper.fields[rHelperKeys[0]].type : 'void';

  const funcName = messageNames[0].replace(/Helper$/, '');
  const protoData = await fs.readFile(protoPath, 'utf8').catch((error) => {
    throw new Error('Error while reading the proto file: ' + error);
  });

  return { argFields, funcName, resType, protoData, protoPath };
}
