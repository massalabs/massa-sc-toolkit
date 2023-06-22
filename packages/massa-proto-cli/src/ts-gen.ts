import { ProtoFile } from './protobuf';

function generateArgVerification(protoFile: ProtoFile): string {
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
