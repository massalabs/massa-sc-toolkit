import { ProtoFile } from './protobuf';

/**
 * Generates the typescript code to import the helper file
 *
 * @param protoFile - The proto file data
 * @param helperRelativePath - The relative path to the previously generated helper
 *
 * @returns The typescript code to import the helper and the Account interface
 */
function generateImports(protoFile: ProtoFile, helperRelativePath): string {
  let content = `import { ${protoFile.funcName}Helper } from "${helperRelativePath}";
  
`;
  return content;
}

function generateIterface(protoFile: ProtoFile): string {
  let content = `export interface TransactionDetails {
  operationId: string;
}

  `;
  return content;
}
