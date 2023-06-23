import { ProtoFile } from './protobuf';

/**
 * Generate the TypeScript code for the ts caller function
 * to serialize the arguments
 *
 * @param protoFile - The protoFile object
 * @returns - The generated serialization code
 */
function argumentSerialization(protoFile: ProtoFile): string {
  let content = `
  // Serialize the arguments
  const serializedArgs = ${protoFile.funcName}Helper.toBinary({
`;
  for (let arg of protoFile.argFields) {
    content += `    ${arg.name}: ${arg.name},\n`;
  }
  content = content.slice(0, -2); // remove the last comma and line break
  content += `\n\t});\n`;
  return content;
}
