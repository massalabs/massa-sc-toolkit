import { writeFileSync } from 'fs';
import { spawnSync } from 'child_process';
import path from 'path';
import { FunctionArgument, ProtoFile } from './protobuf.js';
import { default as asProtoTypes } from './asProtoTypes.json' assert { type: 'json' };
// eslint-disable-next-line
// @ts-ignore
import { debug } from 'console';
import { ProtoType, readRefTable } from '@massalabs/as-transformer';

// @ts-ignore
const refTable = readRefTable();

/**
 * Creates a contract function caller with the given proto file and address.
 *
 * @param protoData - the proto file containing the information to call the contract's function
 * @param address - the address of the contract containing the function to call
 * @param outputDirectory - the output directory to create the file for the caller
 */

function getCustomTypesImports(args: FunctionArgument[]): string {
  let imports: string[] = [];

  for (const arg of args) {
    if (arg.type.metaData !== undefined)
      imports.push(`import { ${arg.type.name} } from '${arg.type.metaData.import}';`);
  }

  return imports.join('\n');
}

export function generateAsCaller(
  protoData: ProtoFile,
  address: string,
): string {
  // check if all the arguments are supported (to avoid 'undefined' objects in the generated code)
  protoData.argFields.forEach(({ type }) => {

    findProtoType(type);

    // TODO X
    if (type.metaData === undefined && asProtoTypes && !Object.prototype.hasOwnProperty.call(asProtoTypes, type.name)) {
      throw new Error(`Unsupported type: ${type}`);
    }
  });


  // generating AS arguments
  let args: string[] = [];
  protoData.argFields.forEach(({ name, type }) => {
    const array= type.repeated ? '[]': '';
    // TODO X
    if (type.metaData !== undefined) {
      args.push(`${name}: ${type.name}${array}`);
    }
    else if (asProtoTypes && Object.prototype.hasOwnProperty.call(asProtoTypes, type.name)) {
      const asType: string = asProtoTypes[type.name as keyof typeof asProtoTypes];
      args.push(`${name}: ${asType}${array}`);
    }
  });
  let resType = 'void';
  let responseDecoding = '';
  let responseTypeImports = '';

  if (protoData.resType && protoData.resType.type.name !== 'void') {
    if (protoData.resType.type.metaData !== undefined) {
      resType = protoData.resType.type.name;
      resType += protoData.resType.type.repeated ? '[]' : '';
    } else {
      resType = asProtoTypes[protoData.resType.type.name as keyof typeof asProtoTypes];
      resType += protoData.resType.type.repeated ? '[]' : '';
    }
    responseTypeImports += `
import { decode${protoData.funcName}RHelper } from './${protoData.funcName}RHelper';`;

    responseDecoding = decodeResponse(protoData);
  }

  const imports = getCustomTypesImports(protoData.argFields) +
    '\n' +
    getCustomTypesImports([protoData.resType]);

  // generating the content of the file
  // eslint-disable-next-line max-len

  // TODO X
  // console.log(protoData.argFields.map(({ name, type }) => console.log("HERE", name, type.name, type.metaData)));

  const content = `import { encode${protoData.funcName}Helper, ${protoData.funcName
    }Helper } from './${protoData.funcName}Helper';${responseTypeImports}
import { call, Address } from "@massalabs/massa-as-sdk";
import { Args } from '@massalabs/as-types';
${imports}

export function ${protoData.funcName}(${args.length > 0 ? args.join(', ') + ', ' : ''
    } coins: u64): ${resType} {

  const result = call(
    new Address("${address}"),
    "${protoData.funcName}",
    new Args(changetype<StaticArray<u8>>(encode${protoData.funcName}Helper(new ${protoData.funcName}Helper(
      ${protoData.argFields.map(({ name, type }) =>
      (generateArgument(type, name))).join(',\n      ')})
    ))),
    coins
  );${responseDecoding}
}
`;

  return content;
}

function findProtoType(type: ProtoType) {
  debug('looking for proto type:', type.name, type.repeated);

  const refTableEntries = refTable.entries();
  // convert the iterator to an array
  const entries = Array.from(refTableEntries);
  const found = entries.filter(([asType, value]) => {
    if (type.metaData && type.name === asType) {
      debug('CT refTable value:', value.name, ' refTable key:', asType);
      return true;
    }
    else if (type.name === value.name) {
      return true;
    }
    else {
      return false;
    }});

  debug('found:', found);
  if (found === undefined) {
    throw new Error(`Unsupported type: ${type}`);
  }






  // const entries = ["",""].filter(([asType, value]) => {
  //   debug('On:', value.name, ' refTable key:', asType);
  //   if (type.metaData && type.name === asType) {
  //     debug('CT refTable value:', value.name, ' refTable key:', asType);
  //     return true;
  //   }
  //   else if (type.name === value.name) {
  //     return true;
  //   }
  //   else {
  //     return false;
  //   }});

  // debug('entries:', entries);
  // for (let i = 0; i < refTableEntries.length; i++) {
  //   const [asType, value] = refTableEntries[i];
  //   if (type.metaData) {
  //     if (type.name === asType) {
  //       debug('CT refTable value:', value.name, ' refTable key:', asType);
  //       continue;
  //     }
  //   } else {
  //     if (type.name === value.name) {
  //       debug('refTable value:', value.name, ' refTable key:', asType);
  //       continue;
  //     }
  //   }
  //   throw new Error(`Unsupported type: ${type}`);
  // }
}

function decodeResponse(protoData: ProtoFile): string {
  let ret = '\n\n';
  ret +=`// Convert the result to the expected response type` + '\n';
  ret +=`const response = decode${protoData.funcName}RHelper(Uint8Array.wrap(changetype<ArrayBuffer>(result)));` + '\n';

  // if not a custom type
  if (!protoData.resType.type.metaData) {
    ret += `return response.value;`;
    return ret;
  }

  // if array of custom type
  if (protoData.resType.type.repeated) {
    const cType = protoData.resType.type.name;
    ret += `return response.value.map<${cType}>((el) => ${protoData.resType.type.metaData.deserialize.replace('\\1', 'el')});`;
  }
  else {
    ret += `return ${protoData.resType.type.metaData.deserialize.replace('\\1', 'response.value')};`;
  }

  return ret;
}

function generateArgument(type: ProtoType, name: string): string {
  // simple type aka not a custom type
  if (!type.metaData) {
    return name;
  }

  // array of custom type
  if (type.repeated) {
    return `${name}.map<Uint8Array>((el) => ${type.metaData.serialize.replace('\\1', 'el')})`;
  }
  // single custom type
  else {
    return type.metaData.serialize.replace('\\1', name);
  }
}

/**
 * Creates the assembly script helper for serializing and deserializing with the given protobuf file.
 *
 * @param protoData - the proto file data.
 * @param outputDirectory - the directory where to generate such helpers.
 */
function generateProtocAsHelper(protoData: ProtoFile, outputDirectory: string) {
  let protocProcess = spawnSync('protoc', [
    // TODO X
    // `--plugin=protoc-gen-as=../../node_modules/.bin/as-proto-gen`,
    `--plugin=protoc-gen-as=./node_modules/.bin/as-proto-gen`,
    `--as_out=${outputDirectory}`,
    `--as_opt=gen-helper-methods`,
    `--proto_path=${outputDirectory}`,
    `${outputDirectory}${protoData.funcName}.proto`,
  ]);

  if (protocProcess.status !== 0) {
    throw new Error(
      `Failed to generate AS helpers code for ${protoData} with error: ${protocProcess.stderr}`,
    );
  }
}

/**
 * Creates assembly script sc callers with the given protobuf files.
 *
 * @param protoFiles - the array of proto files data
 * @param address - the address of the contract where the proto files are coming from
 * @param outputDirectory - the output directory where to generates the callers
 */
export function generateAsCallers(
  protoFiles: ProtoFile[],
  address: string,
  outputDirectory: string,
) {
  for (const file of protoFiles) {
    debug(`Generating AS caller for ${file.funcName}`);
    generateProtocAsHelper(file, outputDirectory);
    const callerContent = generateAsCaller(file, address);

    // Save the content to a ts file
    writeFileSync(
      path.join(outputDirectory, `${file.funcName}Caller.ts`),
      callerContent,
    );
  }
}
