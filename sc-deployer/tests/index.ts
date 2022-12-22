import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Args, deploySC, IAccount, ISCData } from '../dist/index';

const account: IAccount = {
    secretKey: "S126gPee3LJwrQEPqukJ26f6bHG8t5GPwH1WHhR9VpyqrkhkLCGf",
    publicKey: "P12vnX43yGeW4hmiKQ715SKssGbkLNXayZNbfFonyhVoFAhWhumj",
    address: "A1249cYYFbT1BwHdzTQhgf6pv1S6ZLQjd6VReAbbQf9pb4BE4ziU"
}

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

await deploySC(account, [{data: readFileSync(`${__dirname}/test.wasm`), coins: 0, args: new Args().addString("Aurelien")} as ISCData], 0, 1000000);