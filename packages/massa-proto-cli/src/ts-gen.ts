import { ProtoFile } from './protobuf';

/**
 * Generate the TypeScript code to send an operation for the given ProtoFile
 *
 * @param protoFile - The ProtoFile containing .proto file data
 * @param contractAddress - The address of the Smart Contract to call
 * @returns The TypeScript code to send an operation and retrieve its ID
 */
function sendOperation(protoFile: ProtoFile, contractAddress: string): string {
  let content = `
  // Call the Smart Contract and get an operation ID
  const opId = await account.callSC("${contractAddress}", "${protoFile.funcName}", serializedArgs, amount: bigint);
  `;
  return content;
}
