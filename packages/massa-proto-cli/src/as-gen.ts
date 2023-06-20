import { writeFileSync } from 'fs';
import { spawnSync } from 'child_process';
import path from 'path';
import { IProtoFile } from './protobuf';

function convertTypeToAS(type: string): string {
  switch (type) {
    case 'bool':
      return 'bool';
    case 'int32':
      return 'i32';
    case 'int64':
      return 'i64';
    case 'uint32':
      return 'u32';
    case 'uint64':
      return 'u64';
    case 'float':
      return 'f32';
    case 'double':
      return 'f64';
    case 'string':
      return 'string';
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
}

function generateAsImports(protoData: IProtoFile): string {
  let imports = `import { encode${protoData.funcName}Helper, ${protoData.funcName}Helper } `;
  imports += `from './${protoData.funcName}Helper';\n`;

  if (protoData.resType !== null) {
    imports += `import { decode${protoData.funcName}RHelper, ${protoData.funcName}RHelper }`;
    imports += `from './${protoData.funcName}RHelper';\n`;
  }

  imports += 'import { call } from "@massalabs/massa-as-sdk";\n\n';

  return imports;
}

function generateAsCall(
  protoData: IProtoFile,
  address: string,
  outputDirectory: string,
) {
  // generating AS arguments
  let args: string[] = [];
  protoData.argFields.forEach(({ name, type }) =>
    args.push(`${name}: ${convertTypeToAS(type)}`),
  );

  // generating caller
  let caller = `export function ${protoData.funcName}(${
    args.length > 0 ? args.join(', ') + ', coins: number' : 'coins: number'
  }) : ${protoData.resType !== null ? protoData.resType : 'void'} {\n`;
  caller += `  const result = call("${address}", "${
    protoData.funcName
  }", changetype<StaticArray<u8>>(encode${protoData.funcName}Helper(new ${
    protoData.funcName
  }Helper(${Array.from(protoData.argFields.keys()).join(', ')}))), coins);\n`;

  if (protoData.resType !== null) {
    caller += `  const response = decode${protoData.funcName}RHelper(`;
    caller += `Uint8Array.wrap(changeType<ArrayBuffer>(result)));\n\n`;
    caller += '  return response.value;\n';
  }
  caller += '}';

  writeFileSync(
    generateAsImports(protoData) + caller,
    path.join(outputDirectory, protoData.funcName + '.ts'),
  );
}

function generateAsHelper(protoData: IProtoFile, outputDirectory: string) {
  let protocProcess = spawnSync('protoc', [
    `--plugin=protoc-gen-as=./node_modules/.bin/as-proto-gen`,
    `--as_out=${outputDirectory}`,
    `--as_opt=gen-helper-methods`,
    `--proto_path=./build`,
    protoData.fileData,
  ]);

  if (protocProcess.status !== 0) {
    console.error(
      `Failed to generate AS helpers code for ${protoData} with error: ${protocProcess.stderr}`,
    );
  }
}

export function generateAsCallers(
  protoFiles: IProtoFile[],
  address: string,
  outputDirectory: string,
) {
  for (let file of protoFiles) {
    generateAsHelper(file, outputDirectory);
    generateAsCall(file, address, outputDirectory);
  }
}
