import { readFileSync } from 'fs';
import path from 'path';
import { Args, deploySC, IAccount, ISCData } from '../dist/index';

const account: IAccount = {
    secretKey: "S126gPee3LJwrQEPqukJ26f6bHG8t5GPwH1WHhR9VpyqrkhkLCGf",
    publicKey: "P12vnX43yGeW4hmiKQ715SKssGbkLNXayZNbfFonyhVoFAhWhumj",
    address: "A1249cYYFbT1BwHdzTQhgf6pv1S6ZLQjd6VReAbbQf9pb4BE4ziU"
}

await deploySC("localhost:33035", account, [{data: readFileSync(path.join('build', 'test.wasm')), coins: 0, args: new Args().addString("Aurelien")} as ISCData], 0, 4_200_000_000);
