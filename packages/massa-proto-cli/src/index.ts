#!/usr/bin/env node
import { MassaProtoFile } from './MassaProtoFile.js';
import { generateAsCallers } from './as-gen.js';
import { generateTsCallers } from './ts-gen.js';
import { ProtoFile, getProtoFiles, getProtoFunction } from './protobuf.js';
import { Command } from 'commander';
import { MassaCustomType, extractTypes } from '@massalabs/as-transformer';
import * as dotenv from 'dotenv';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

// Load .env file content into process.env
dotenv.config();
const program = new Command();

program
  .option(
    '-g, --gen <mode>',
    'the generation mode for contracts callers (sc) or web3 app (web3)',
    'sc',
  )
  .option(
    '-a, --addr <value>',
    'the public address of the contract to interact with',
    '',
  )
  .option(
    '-o, --out <path>',
    'optional output directory for the callers to generate',
    './helpers/',
  )
  .parse();

// Get the URL for a public JSON RPC API endpoint from the environment variables
const publicApi = process.env['JSON_RPC_URL_PUBLIC'];
if (!publicApi) {
  throw new Error('Missing JSON_RPC_URL_PUBLIC in .env file');
}

/**
 * Massa-Proto-Cli program entry point.
 *
 * @param arguments - arguments.
 */
async function run() {
  const args = program.opts();
  let files: ProtoFile[] = [];
  let mode: string = args['gen'];
  let address: string = args['addr'];
  let out: string = args['out'];

  if (mode === '' || address === '' || publicApi === undefined) {
    program.help();
    return;
  }

  // execute 'mkdir helpers' if the folder doesn't exist yet
  if (!existsSync(out)) {
    mkdirSync(out);
  }

  // if mode is 'get-protofile', we only need to fetch the proto files and save them
  if (mode === 'get-protofile') {
    const folderName = address.slice(-10);
    // check if the folder exists
    if (!existsSync(path.join(out, folderName))) {
      mkdirSync(path.join(out, folderName));
    }
    await getProtoFiles([address], out + '/' + folderName, publicApi);
    return;
  }

  // call sc client to fetch protos
  const mpFiles: MassaProtoFile[] = await getProtoFiles(
    [address],
    out,
    publicApi,
  );
  console.warn(
    `For now, we are only using the following custom types because the fetching as issues: u128, u256`,
  );
  const bignumTypes = `- type:
  name: u256
  proto: bytes
  import: "as-bignum/assembly"
  serialize: "\\\\1.toUint8Array()"
  deserialize: "u256.fromUint8ArrayLE(\\\\1)"
- type:
  name: u128
  proto: bytes
  import: "as-bignum/assembly"
  serialize: "\\\\1.toUint8Array()"
  deserialize: "u128.fromUint8ArrayLE(\\\\1)"
`;
  // call proto parser with fetched files
  const customTypes: MassaCustomType[] = extractTypes(bignumTypes);

  for (const mpfile of mpFiles) {
    let protoFile = await getProtoFunction(mpfile.filePath, customTypes);
    files.push(protoFile);
  }

  // call the generator
  if (mode === 'sc') {
    generateAsCallers(files, address, out);
  } else if (mode === 'web3' || mode === 'wallet') {
    generateTsCallers(files, out, address, mode, address.slice(-10));
  } else {
    throw new Error(`Unsupported mode: ${mode}`);
  }
}

run();
