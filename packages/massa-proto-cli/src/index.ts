#!/usr/bin/env node
import { MassaProtoFile } from '@massalabs/massa-web3/dist/esm/interfaces/MassaProtoFile';
import { generateAsCallers } from './as-gen';
import { ProtoFile } from './protobuf';
import {
  Client,
  ClientFactory,
  IProvider,
  ProviderType,
  WalletClient,
} from '@massalabs/massa-web3';
import { Command } from "commander";

import * as dotenv from 'dotenv';
// Load .env file content into process.env
dotenv.config();
const program = new Command();

program
.option('-g, --gen <mode>', 'the generation mode for contracts callers (sc) or web3 app (web3)', "sc")
.option('-a, --addr <value>', 'the public address of the contract to interact with', "")
.option('-o, --out <path>', 'optional output directory for the callers to generate', "./helpers/")
.parse()

// Get the URL for a public JSON RPC API endpoint from the environment variables
const publicApi = process.env.JSON_RPC_URL_PUBLIC;
if (!publicApi) {
  throw new Error('Missing JSON_RPC_URL_PUBLIC in .env file');
}

// Get the secret key for the wallet to be used for the deployment from the environment variables
const secretKey = process.env.WALLET_SECRET_KEY;
if (!secretKey) {
  throw new Error('Missing WALLET_SECRET_KEY in .env file');
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
  let mode = args["gen"];
  let address = args["addr"];
  let out = args["out"];

  if (mode === '' || address === '') {
    program.help();
    return 1;
  }
  const deployerAccount = await WalletClient.getAccountFromSecretKey(secretKey);
  const client: Client = await ClientFactory.createCustomClient(
    [
      { url: publicApi, type: ProviderType.PUBLIC } as IProvider,
      // This IP is false but we don't need private for this script so we don't want to ask one to the user
      // but massa-web3 requires one
      { url: publicApi, type: ProviderType.PRIVATE } as IProvider,
    ],
    true,
    deployerAccount,
  );
  // call sc client to fetch protos
  let pFiles: MassaProtoFile[] = await client
    .smartContracts()
    .getProtoFiles([address], out);
  // call proto generator with fetched files
  // TODO: @Elli610

  // call the generator
  if (mode === 'sc') {
    generateAsCallers(files, address, out);
  }
}

run();
