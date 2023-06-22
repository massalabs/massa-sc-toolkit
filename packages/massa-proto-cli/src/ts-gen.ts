import { ProtoFile } from './protobuf';

/**
 * Generates code to check if unsigned arguments of a protobuf message are negative.
 *
 * @param {ProtoFile} protoFile - The protofile object.
 * @return {string} The string containing code for unsigned argument checks.
 */
function generateUnsignedArgCheckCode(protoFile: ProtoFile): string {
  const unsignedPBTypes = new Set(['uint32', 'uint64', 'fixed32', 'fixed64']);
  let content = '';
  for (let arg of protoFile.argFields) {
    if (unsignedPBTypes.has(arg.type)) {
      content += `
  if (${arg.name} < 0) {
    throw new Error("Invalid argument: ${arg.name} cannot be negative accordind to protobuf file.");
  }
  `;
    }
  }
  return content;
}
