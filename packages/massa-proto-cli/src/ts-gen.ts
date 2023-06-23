import { execSync } from 'child_process';

/**
 * Generates TypeScript helper class for a given .proto file to allow
 * serialization/deserialization.
 *
 * @param protoFile - The path to the proto file.
 * @param helperFilePath - The path to save the helper file.
 */
export function generateTSHelper(
  protoFilePath: string,
  helperFilePath: string,
): void {
  // generate the helper file using protoc. Throws an error if the command fails.
  const command = `npx protoc --ts_out="${helperFilePath}" ${protoFilePath}`;
  execSync(command, { stdio: 'inherit' });
}
