import { MassaProtoFile } from '@massalabs/massa-web3/dist/esm/interfaces/MassaProtoFile';
import { generateAsCallers } from './as-gen';
import { IProtoFile } from './protobuf';
import { Client, ClientFactory, IProvider, ProviderType, SmartContractsClient, WalletClient } from '@massalabs/massa-web3';
import * as dotenv from 'dotenv';

// Load .env file content into process.env
dotenv.config();

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
const deployerAccount = await WalletClient.getAccountFromSecretKey(secretKey);

function displayHelp() {
  console.log('Usage:');
  console.log('npx massa-proto-cli');
  console.log(
    '\t\t--gen sc|web3\t- the generation mode for contracts callers (sc) or web3 app (web3)',
  );
  console.log(
    '\t\t--addr contract_public_key\t- the public address of the contract to interact with',
  );
  console.log(
    '\t\t[--out output_directory]\t- optional output directory for the callers to generate (default: .)',
  );
  process.exit(1);
}

function getGenMode(args: string[]): string {
  let index = args.indexOf('--gen');
  if (index >= 0 && index + 1 < args.length) {
    return args[index + 1];
  }
  displayHelp();
  return '';
}

function getAddr(args: string[]): string {
  let index = args.indexOf('--addr');
  if (index >= 0 && index + 1 < args.length) {
    return args[index + 1];
  }
  displayHelp();
  return '';
}

function getDir(args: string[]): string {
  let index = args.indexOf('--out');
  if (index >= 0 && index + 1 < args.length) {
    return args[index + 1];
  }
  return './helpers/';
}

async function run(args: string[]) {
  let files: IProtoFile[] = [];
  let mode = getGenMode(args);
  let address = getAddr(args);
  let out = getDir(args);

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
  let pFiles : MassaProtoFile[] = await client.smartContracts().getProtoFiles([address], out);
  // call proto generator with fetched files
  // TODO: @Elli610

  // call the generator
  if (mode === 'sc') {
    generateAsCallers(files, address, out);
  }
}

run(process.argv);
