import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { deploySC, WalletClient, ISCData } from '@massalabs/massa-sc-deployer';
// TODO: add typings for deploy config
// @ts-ignore
import config from '../deploy.config';

dotenv.config();

const publicApi = process.env.JSON_RPC_URL_PUBLIC;
if (!publicApi) {
  throw new Error('Missing JSON_RPC_URL_PUBLIC in .env file');
}
const privKey = process.env.WALLET_PRIVATE_KEY;
if (!privKey) {
  throw new Error('Missing WALLET_PRIVATE_KEY in .env file');
}

const deployerAccount = await WalletClient.getAccountFromSecretKey(privKey);

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(path.dirname(__filename));

if (config.targets.length > 1) {
  console.log(
    `Warning: Only one target is supported for deployment. Loading target ${config.targets[0].name}`,
  );
}
const target = config.targets[0];
console.log(`Deploying target ${config.targets[0].name}`);

(async () => {
  await deploySC(
    publicApi,
    deployerAccount,
    [
      {
        data: readFileSync(path.join(__dirname, target.wasmFile)),
        coins: 0,
        args: target.args,
      } as ISCData,
    ],
    0,
    4_200_000_000,
    true,
  );
})();
