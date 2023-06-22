import { ProtoFile, tempProtoFilePath } from './protobuf';
import * as returnType from './ProtoTypes.json';
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

  // generate the caller file
  let content = `import { ${protoFile.funcName}Helper } from "${helperRelativePath}";\n\n`;

  // generate the caller function header
  content += `export async function ${protoFile.funcName}(`;
  for (let arg of protoFile.argFields) {
    if (!returnType[arg.type]) {
      throw new Error('Invalid type: ' + arg.type);
    }
    content += `${arg.name}: ${returnType[arg.type]}, `;
  }
  content = content.slice(0, -2); // remove the last comma and space
  content += `): Promise<${protoFile.resType}> {\n`;

  // verify that the given arguments are valid
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

  // generate the caller function body
  content += `\t// Serialize the arguments\n`;
  content += `\tconst serializedArgs = ${protoFile.funcName}Helper.toBinary({\n`;
  for (let arg of protoFile.argFields) {
    content += `\t\t${arg.name}: ${arg.name},\n`;
  }
  content = content.slice(0, -2); // remove the last comma and line break
  content += `\n\t});\n`;
  content += `\t// Call the Smart Contract and get an operation ID\n`;

  // set the contract address to the default value if it is not provided
  if (!contractAddress) {
    contractAddress = 'Paste your contract address here';
  }

  // call the contract
  content += `\tconst opId = await callContract("${contractAddress}", "${protoFile.funcName}", serializedArgs);\n`;

  // return the operation ID
  content += `\treturn opId;\n`;
  content += `}\n`;

  // save content to file
  const fileName = `${protoFile.funcName}.ts`;
  writeFileSync(tempProtoFilePath + fileName, content, 'utf8');
  console.log('Generated caller file: ' + fileName);
  console.log('file generated at: ', tempProtoFilePath + fileName);
}
