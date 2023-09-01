#!/usr/bin/env node
import { MassaProtoFile } from './MassaProtoFile.js';
import { generateAsCallers } from './as-gen.js';
import { generateTsCallers } from './ts-gen.js';
import { ProtoFile, getProtoFiles, getProtoFunction } from './protobuf.js';
import { Command } from 'commander';
import { ProtoType, fetchCustomTypes, readRefTable } from '@massalabs/as-transformer';
import * as dotenv from 'dotenv';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { exec, execSync } from 'child_process';

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
  .parse(process.argv);

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

  // check if the necessary dependencies are installed
  let missingDeps: string[] = [];
  if (mode === 'sc') {
    /* check if the following node dependencies are installed:
      - as-proto
      - as-proto-gen
      - @massalabs/massa-as-sdk
      - @massalabs/as-types
      - @massalabs/as-transformer
    */
    const deps = [
      'as-proto',
      'as-proto-gen',
      '@massalabs/massa-as-sdk',
      '@massalabs/as-types',
      '@massalabs/as-transformer',
    ];
    try {
      missingDeps = await missingDependencies(deps);
    } catch (e) {
      throw new Error(`Error checking for dependencies: ${e}`);
    }
  } else if (mode === 'web3' || mode === 'wallet') {
    /* check if the following node dependencies are installed:
      - @massalabs/massa-web3
      - @protobuf-ts/plugin
    */
    const deps = ['@massalabs/massa-web3', '@protobuf-ts/plugin'];
    try {
      missingDeps = await missingDependencies(deps);
    } catch (e) {
      throw new Error(`Error checking for dependencies: ${e}`);
    }
  }
  if (missingDeps.length > 0) {
    /* eslint-disable-next-line no-console */
    console.log(`Missing dependencies: ${missingDeps.join(', ')}`);

    for (const dep of missingDeps) {
      /* eslint-disable-next-line no-console */
      console.log(`Installing dependency ${dep}...`);
      installDependency(dep);
    }
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
  /* eslint-disable-next-line no-console */
  console.warn(
    `For now, we are only using the following custom types because the fetching as issues: u128, u256`,
  );

  // recover any accessible and defined custom protobuf types
  const customs = fetchCustomTypes();
  const refTable = readRefTable();
  const types: Map<string, ProtoType> = new Map([...customs, ...refTable]);

  for (const mpfile of mpFiles) {
    let protoFile = await getProtoFunction(mpfile.filePath, types);
    files.push(protoFile);
  }

  // call the generator
  if (mode === 'sc') {
    generateAsCallers(files, address, out, types);
  } else if (mode === 'web3' || mode === 'wallet') {
    generateTsCallers(files, out, address, mode, address.slice(-10));
  } else {
    throw new Error(`Unsupported mode: ${mode}`);
  }
}

async function missingDependencies(dependencies: string[]): Promise<string[]> {
  return new Promise((resolve, reject) => {
    exec('npm list --depth=0', (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      const notInstalled: string[] = [];
      for (const dependency of dependencies) {
        // check if dependency contains / and replace it with \/
        const regexDependency = dependency.replace('/', '\\/');

        const regex = new RegExp(`${regexDependency}`, 'i');
        if (!regex.test(stdout)) {
          notInstalled.push(dependency);
        }
      }
      resolve(notInstalled);
    });
  });
}

function installDependency(dep: string) {
  try {
    execSync(`npm install ${dep}`);
  } catch (e) {
    throw new Error(`Error installing dependency ${dep}: ${e}`);
  }
}

run();
