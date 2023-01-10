import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { deploySC, WalletClient, ISCData } from '@massalabs/massa-sc-deployer';
import { Args } from '@massalabs/massa-web3';
import fs from 'fs';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.dirname(__filename));

const isWasmFile = (contractWasm: string) => {
  if (contractWasm.substring(contractWasm.length - 5) !== '.wasm') {
    throw new Error(`${contractWasm} is not a .wasm file`);
  }
};

const fileExists = (contractWasm: string) => {
  if (!fs.existsSync(contractWasm)) {
    throw new Error(
      `Wasm contract file "${contractWasm}" does not exist. Did you forget to compile ?`,
    );
  }
};

let wasmFile = process.argv[2];
if (!wasmFile) {
  wasmFile = path.join(__dirname, 'build', 'main.wasm');
}
isWasmFile(wasmFile);
fileExists(wasmFile);

const publicApi = process.env.JSON_RPC_URL_PUBLIC;
if (!publicApi) {
  throw new Error('Missing JSON_RPC_URL_PUBLIC in .env file');
}
const privKey = process.env.WALLET_PRIVATE_KEY;
if (!privKey) {
  throw new Error('Missing WALLET_PRIVATE_KEY in .env file');
}

const deployerAccount = await WalletClient.getAccountFromSecretKey(privKey);

(async () => {
  await deploySC(
    publicApi,
    deployerAccount,
    [
      {
        data: readFileSync(wasmFile),
        coins: 0,
        args: new Args().addString('Test'),
      } as ISCData,
    ],
    0,
    4_200_000_000,
    true,
  );
})();
