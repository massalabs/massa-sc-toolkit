import {
    ClientFactory,
    Client,
    DefaultProviderUrls,
    IAccount
} from "@massalabs/massa-web3";

// create a base account for signing transactions
const baseAccount = {
  address: 'A1249cYYFbT1BwHdzTQhgf6pv1S6ZLQjd6VReAbbQf9pb4BE4ziU',
  secretKey: 'S126gPee3LJwrQEPqukJ26f6bHG8t5GPwH1WHhR9VpyqrkhkLCGf',
  publicKey: 'P12vnX43yGeW4hmiKQ715SKssGbkLNXayZNbfFonyhVoFAhWhumj'
} as IAccount;

// initialize a testnet client
const testnetClient: Client = await ClientFactory.createDefaultClient(
    DefaultProviderUrls.LABNET,
    true,
    baseAccount
);