#!/usr/bin/env node
import { MassaProtoFile } from './MassaProtoFile.js';
import { generateAsCallers } from './as-gen.js';
import { generateTsCallers } from './ts-gen.js';
import { ProtoFile, getProtoFiles, getProtoFunction } from './protobuf.js';
import { Command } from 'commander';
import {
  MassaCustomType,
  fetchCustomTypes,
} from '@massalabs/as-transformer';
import * as dotenv from 'dotenv';
import { existsSync, mkdirSync } from 'fs';
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

// Create an account using the private key

/**
 * Massa-Proto-Cli program entry point.
 *
 * @param arguments - arguments.
 */
async function run() {
  const args = program.opts();
  let files: ProtoFile[] = [];
  let mode = args['gen'];
  let address = args['addr'];
  let out = args['out'];

  if (mode === '' || address === '' || publicApi === undefined) {
    program.help();
    return;
  }

  // execute 'mkdir helpers' if the folder doesn't exist yet
  if (!existsSync(out)) {
    mkdirSync(out);
  }

  // call sc client to fetch protos
  const mpFiles: MassaProtoFile[] = await getProtoFiles(
    [address],
    out,
    publicApi,
  );

  // call proto parser with fetched files
  const customTypes: MassaCustomType[] = fetchCustomTypes();

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
