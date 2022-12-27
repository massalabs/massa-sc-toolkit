# How to use

You now have your own AssemblyScript project setup, with Massa's sdk installed.

You can now run `npm run build` to compile your AssemblyScript files.

By default it will build all files in `assembly/contracts` directory.

To use libraries as `massa-as-sdk` and `@massalabs/as` you need to import the required function, for instance :

```jsx
import { generateEvent } from "@massalabs/massa-as-sdk";
export function HelloWorld(): void {
    generateEvent(`Hello World`);
}
```

## How to …

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
  - WALLET_PRIVATE_KEY="wallet_private_key"
  - JSON_RPC_URL_PUBLIC=<https://test.massa.net/api/v2:33035>

These keys will be the ones used by the deployer script to interact with the blockchain.

The following command will build your contract and create the deployer associated:
It assumes your contract entrypoint is `assembly/main.ts`

```shell
npm run build
```

Then deploy your contract with:

```shell
npm run deploy
```

This command will deploy your smart contract on Massa's network corresponding to the given node.

When you deploy a contract the function `constructor` is called. If you want ot deploy more contracts or pass parameter to the constructor function you have to modify `src/deploy.ts`. Even if you want the default behavior it's cool to take a look at it.

### ... Run unit tests

Check examples in `./assembly/__test__/massa-example.spec.ts`

Check the documentation on <https://as-pect.gitbook.io/as-pect>

Run the following commands :

- To run test from all spec.ts files in your assembly folder

```shell
npm run test
```
