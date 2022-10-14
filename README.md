# massa-sc-toolkit

This toolkit is meant to facilitate smart contract development.

> **PREREQUISITES:** NPM installed on your computer

## Repository Initialisation

Simply run the following command:

```shell
npx github:massalabs/massa-sc-toolkit init <projectName>
```

You now have your own AssemblyScript project setup, with Massa's sdk installed.

You can now run `npm run asbuild` to compile your AssemblyScript files.

To use librairies as massa-as-sdk and @massalabs/as you need to import the required function, for instance :

```jsx
import { generateEvent } from "@massalabs/massa-as-sdk";
export function HelloWorld(): void {
    generateEvent(`Hello World`);
}
```

## How to …

### Include another smart contract inside a smart contract ?

You can follow the following documentation :

https://github.com/massalabs/as/tree/main/transformer

### ... use a linter

There is no specific, well-maintained Assemblyscript linter in the ecosystem.

Since Assemblyscript is a subset of Typescript, the recommendation is to use a Typescript linter.

The reference today remains ESLint, therefore the initialization script performs:

-   the installation of the dependencies necessary for its execution;
-   a minimalist configuration of ESlint and prettier (the one used by MassaLabs for its projects).

Keep in mind that many false positives will remain undetected by ESLint such as :

-   Closures
-   Spreads

### ... deploy a smart contract

Prerequisites :

-   You must add a .env file at the root of the repository with the following keys set to valid values :
    -   DEFAULT_WALLET_PRIVATE_KEY="wallet_private_key"
    -   DEFAULT_WALLET_PUBLIC_KEY="wallet_public_key"
    -   DEFAULT_WALLET_ADDRESS="wallet_address"

These keys will be the ones used by the deployer script to interact with the blockchain.

Simply run the following command :

```shell
npm run deploy <path_to_compiled_smart_contract>
```

This command will deploy your smart contract on Massa's Innonet.

### ... Realize unit tests

Check examples in `./assembly/__test__/example.spec.ts`

Check the documentation on "https://github.com/massalabs/as/tree/main/tester"

Run the following commands :

-   To run test from all spec.ts files in your assembly folder

```shell
npx astester
```

-   To run test on specified path

```shell
npx astester ./assembly/__test__/example.spec.ts
```
