# How to use

You now have your own AssemblyScript project setup, with Massa's sdk installed.

To use libraries as `@massalabs/massa-as-sdk` and `@massalabs/as` you need to import the required function, for instance :

```jsx
import { generateEvent } from "@massalabs/massa-as-sdk";
export function HelloWorld(): void {
    generateEvent(`Hello World`);
}
```

## Build

By default this will build all files in `assembly/contracts` directory.

```shell
npm run build
```


## Deploy a smart contract

Prerequisites :

- You must add a .env file at the root of the repository with the following keys set to valid values :
  - WALLET_PRIVATE_KEY="wallet_private_key"
  - JSON_RPC_URL_PUBLIC=<https://test.massa.net/api/v2:33035>

These keys will be the ones used by the deployer script to interact with the blockchain.

The following command will build your contract and create the deployer associated. Then it will be deployed. 
It assumes your contract entrypoint is `assembly/main.ts`

```shell
npm run deploy
```

This command will deploy your smart contract on Massa's network corresponding to the given node.

When the deployment transaction is executed onchain, the `constructor` function of your smart contract `assembly/main.ts` will be called.
The `constructor` function can be modified for specific needs, and its call arguments edited in the deployment script `src/deploy.ts`.

## Unit tests

A test sample is provided as example here:  `./assembly/__test__/massa-example.spec.ts`

Test framework documentation is available here: [as-pect docs](https://as-pect.gitbook.io/as-pect)

```shell
npm run test
```

## Format code

```shell
npm run fmt
```
