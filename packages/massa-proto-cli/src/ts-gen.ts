import { ProtoFile } from './protobuf';

/**
 * Generates the protobuf helper import.
 *
 * @param protoFile - The proto file data
 * @param helperRelativePath - The relative path to the previously generated helper
 * @returns The TypeScript code to import the helper and the Account interface
 */
function generateImports(
  protoFile: ProtoFile,
  helperRelativePath: string,
): string {
  return `import { ${protoFile.funcName}Helper } from "${helperRelativePath}";`;
}

/**
 * Generates the TransactionDetails interface used to get the operation Id returned by a Massa node.
 * @param protoFile - The proto file data
 * @returns The TypeScript code that represents the interface.
 */
function generateTransactionDetailsExport(protoFile: ProtoFile): string {
  return `export interface TransactionDetails {
  operationId: string;
}`;
}
