import { ProtoFile } from './protobuf';

/**
 * Generates the typescript code to import the helper and
 * the Account interface for the ts Caller
 *
 * @param protoFile - The proto file data
 * @param helperRelativePath - The relative path to the previously generated helper
 *
 * @returns The typescript code to import the helper and the Account interface
 */
function generateImports(protoFile: ProtoFile, helperRelativePath): string {
  let content = `import { ${protoFile.funcName}Helper } from "${helperRelativePath}";\n\n`;
  content += `import { Account } from 'wallet-provider';`;
  content += `export interface ITransactionDetails {
    operationId: string;
  }\n`;
  return content;
}
