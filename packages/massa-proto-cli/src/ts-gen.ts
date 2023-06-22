import { ProtoFile } from './protobuf';

function generateBody(protoFile: ProtoFile): string {
  let content = `\t// Serialize the arguments\n`;
  content += `\tconst serializedArgs = ${protoFile.funcName}Helper.toBinary({\n`;
  for (let arg of protoFile.argFields) {
    content += `\t\t${arg.name}: ${arg.name},\n`;
  }
  content = content.slice(0, -2); // remove the last comma and line break
  content += `\n\t});\n`;
  content += `\t// Call the Smart Contract and get an operation ID\n`;
  return content;
}
