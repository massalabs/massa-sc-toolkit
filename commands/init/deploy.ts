import * as dotenv from 'dotenv'
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Args, deploySC, WalletClient, ISCData } from '@massalabs/massa-sc-deployer';

dotenv.config();

if (!process.env.WALLET_PRIVATE_KEY) {
    throw new Error('Missing WALLET_PRIVATE_KEY in .env file');
}

const deployerAccount = await WalletClient.getAccountFromSecretKey(process.env.WALLET_PRIVATE_KEY);

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

await deploySC(
    deployerAccount, 
    [
        {data: readFileSync(`${__dirname}/build/main.wasm`), coins: 0, args: new Args().addString('Test')} as ISCData
    ],
    0,
    4_200_000_000
);