import { ProtoFile } from './protobuf';

/**
 * Generates code to check if unsigned arguments of a protobuf message are negative.
 *
 * @param protoFile - The protofile object.
 * @returns The string containing code for unsigned argument checks.
 */
function generateUnsignedArgCheckCode(protoFile: ProtoFile): string {
  const unsignedPBTypes = new Set(['uint32', 'uint64', 'fixed32', 'fixed64']);
  let content = '';
  for (const arg of protoFile.argFields) {
    if (unsignedPBTypes.has(arg.type)) {
      content += `
  if (${arg.name} < 0) {
    throw new Error("Invalid argument: ${arg.name} cannot be negative according to protobuf file.");
  }
  `;
    }
  }
  return content;
}
