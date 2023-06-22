import { ProtoFile } from './protobuf';

function generateImports(protoFile: ProtoFile, helperRelativePath): string {
  let content = `import { ${protoFile.funcName}Helper } from "${helperRelativePath}";\n\n`;
  content += `import { Account } from 'wallet-provider';`;
  content += `export interface ITransactionDetails {
    operationId: string;
  }\n`;
  return content;
}
