#!/usr/bin/env node
import { MassaProtoFile } from '@massalabs/massa-web3/dist/esm/interfaces/MassaProtoFile';
import { generateAsCallers } from './as-gen';
import { generateTsCallers } from './ts-gen';
import { ProtoFile, getProtoFunction } from './protobuf';
import { SmartContractsClient } from '@massalabs/massa-web3';
import { Command } from 'commander';

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
const publicApi = process.env.JSON_RPC_URL_PUBLIC;
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

  if (mode === '' || address === '') {
    program.help();
    return 1;
  }
  if (out === '') {
    out = './helpers/';
    // execute 'mkdir helpers' if the folder doesn't exist yet
    if (!existsSync(out)) {
      mkdirSync(out);
    }
  }

  // call sc client to fetch protos
  const mpFiles: MassaProtoFile[] = await SmartContractsClient.getProtoFiles(
    [address],
    out,
    publicApi,
  );

  // call proto parser with fetched files
  for (const mpfile of mpFiles) {
    let protoFile = await getProtoFunction(mpfile.filePath);
    files.push(protoFile);
  }

  // call the generator
  if (mode === 'sc') {
    generateAsCallers(files, address, out);
  } else if (mode === 'web3') {
    generateTsCallers(files, out, publicApi, address);
  } else {
    throw new Error(`Unsupported mode: ${mode}`);
  }
}

run();
