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
import { generateEvent } from '@massalabs/massa-as-sdk';
export function HelloWorld(): void {
	generateEvent(`Hello World`);
}
```

## How to …

### Include another smart contract inside a smart contract ?

You can follow the following documentation :

https://github.com/massalabs/as/tree/main/transformer

## ... use the simulator

**_The simulator_** (massa-sc-tester https://github.com/massalabs/massa-sc-tester) mimics the behavior at ledger level of the Massa Blockchain.
It can also handle smart contracts deployment & smart contract calls. It means that all storage & coin balances modification are taken into account
.
It provides :

-   A mocked ledger => `ledger.json` :

    -   contains by **_address_** : **_coin balances_** , **_bytecode contents_** and **_datastore_**
    -   can be initialized by any mock
    -   will be modified after execution

-   An execution `.json` ("execution.config.json") file :

    -   Consumed by the `massa-sc-tester.exe`
    -   List all steps to be executed by the simulator (full example at https://github.com/massalabs/massa-sc-tester/blob/main/execution_config.json to know all examples )
    -   Can read & execute `.wasm` smart contracts

-   A `trace.json` file overriden at each execution :

    -   Log smart contract events
    -   Log transaction information

    To run the steps detailed in the `execution_config.json` :

The example already set up can be run with :

-   Compiling the example smart contracts
    ```
    $ npm run build
    ```
-   Running the simulate script
    ```
    $ npm run simulate
    ```
### ... use a linter

There is no specific, well-maintained Assemblyscript linter in the ecosystem.

Since Assemblyscript is a subset of Typescript, the recommendation is to use a Typescript linter.

The reference today remains ESLint, therefore the initialization script performs:
- the installation of the dependencies necessary for its execution;
- a minimalist configuration of ESlint and prettier (the one used by MassaLabs for its projects).

Keep in mind that many false positives will remain undetected by ESLint such as :
- Closures
- Spreads

### ... deploy a smart contract

Prerequisites :

- You must add a .env file at the root of the repository with the following keys set to valid values :
  - DEFAULT_WALLET_PRIVATE_KEY="wallet_private_key"
  - DEFAULT_WALLET_PUBLIC_KEY="wallet_public_key"
  - DEFAULT_WALLET_ADDRESS="wallet_address"

These keys will be the ones used by the deployer script to interact with the blockchain.

Simply run the following command :

```shell
npm run deploy <path_to_compiled_smart_contract>
```

This command will deploy your smart contract on Massa's Innonet.
