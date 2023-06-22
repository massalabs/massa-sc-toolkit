import { ProtoFile } from './protobuf';
import * as returnType from './protoTypes.json';

function generateHeader(protoFile: ProtoFile): string {
  let content = `export async function ${protoFile.funcName}(account: Account,`;
  for (let arg of protoFile.argFields) {
    if (!returnType[arg.type]) {
      throw new Error('Invalid type: ' + arg.type);
    }
    content += `${arg.name}: ${returnType[arg.type]}, `;
  }
  content = content.slice(0, -2); // remove the last comma and space
  content += `): Promise<${protoFile.resType}> {\n`;
  return content;
}
