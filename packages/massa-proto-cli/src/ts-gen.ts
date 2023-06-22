import { ProtoFile } from './protobuf';
import * as returnType from './protoTypes.json';

/**
 * Generate the typescript function header from the proto file
 *
 * @param protoFile - The proto file object
 * @returns The typescript function header
 */
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
