import { ProtoFile, tempProtoFilePath } from './protobuf';
import { writeFileSync } from 'fs';

export function generateTSCaller(
  outputPath: string,
  helperRelativePath: string,
  protoFile: ProtoFile,
  contractAddress?: string,
) {
  // generate the helper file using protoc. Throws an error if the command fails.
  try {
    generateTSHelper(protoFile, outputPath);
  } catch (e) {
    throw new Error('Error while generating the helper file: ' + e);
  }

  let content = '';

  // generate the caller imports
  content += generateImports(protoFile, helperRelativePath);

  // generate the caller function header
  content += generateHeader(protoFile);

  // verify that the given arguments are valid
  content += generateArgVerification(protoFile);

  // generate the caller function body
  content += argumentSerialization(protoFile);

  // send the operation to the blockchain using the provider
  if (!contractAddress) {
    contractAddress = 'Paste your contract address here';
  }
  content += sendOperation(protoFile, contractAddress);

  // use the operation ID to get the events generated and the output of the sc function
  content += getResultFromOpID();

  // return the event generated and the output of the sc function
  content += `\treturn outputData;\n`;
  content += `}\n`;

  // save content to file
  const fileName = `${protoFile.funcName}.ts`;
  writeFileSync(tempProtoFilePath + fileName, content, 'utf8');
  console.log('Generated caller file: ' + fileName);
  console.log('file generated at: ', tempProtoFilePath + fileName);
}
