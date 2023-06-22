import { ProtoFile } from './protobuf';

/**
 * Generates code to check if unsigned arguments of a protobuf message are negative.
 * @param {ProtoFile} protoFile - The protofile object.
 * @return {string} The string containing code for unsigned argument checks.
 */
function generateUnsignedArgCheckCode(protoFile: ProtoFile): string {
  let content = '';
  for (let arg of protoFile.argFields) {
    if (
      arg.type === 'uint32' ||
      arg.type === 'uint64' ||
      arg.type === 'fixed32' ||
      arg.type === 'fixed64'
    ) {
      content += `\tif(${arg.name} < 0){\n`;
      content += `\t\tthrow new Error("Invalid argument: ${arg.name} cannot be negative");\n`;
      content += `\t}\n`;
    }
  }
  return content;
}
