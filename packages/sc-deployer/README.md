# Massa smart-contract Deployer

This package can deploy a smart contract with an initialization function.

## Usage

### Install

To get the stable version: `npm i -D @massalabs/massa-sc-deployer`.

To get the nightly version: `npm i -D @massalabs/massa-sc-deployer@dev`.

To update the nightly version: `npm update @massalabs/massa-sc-deployer`.

### Write your smart contract

In your smart contract, add an optional `constructor` function:

```typescript
/**
 * This function is meant to be called only one time: when the contract is deployed.
 *
 * @param binaryArgs - Arguments serialized with Args
 */
export function constructor(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  // This line is important. It ensures that this function can't be called in the future.
  // If you remove this check, someone could call your constructor function and reset your SC.
  if (!callerHasWriteAccess()) {
    return [];
  }
  // Initialize your smart contract
  ...
  return [];
}
```

### Use this library to deploy it

You can write a deployment script that uses massa-web3 library and this sc-deployer to create complex deployment process.

A simple use-case is as follows:

```typescript
import { readFileSync } from 'fs';
import { deploySC, WalletClient, ISCData } from '@massalabs/massa-sc-deployer';
import { Args } from '@massalabs/massa-web3';

(async () => {
  await deploySC(
    'http://127.0.0.1:33035', // deploy on your local sandbox node
    await WalletClient.getAccountFromSecretKey('my private key'), 
    [
      {
        data: readFileSync('path/to/theContractIWantToDeploy.wasm'), // path to the compiler contract to deploy
        coins: 0, // amount of Massa coin to send to the deployment transaction
        args: new Args().addString('Test'), // Arguments to pass to the constructor of the contract, use `NoArg` if any
      } as ISCData,
    ],
    0, // fees
    4_200_000_000, // max gas
    true, // wait for the first event to be emitted and print it into the console.
  );
})();
```

## Contribute

### Development setup

```bash
# Install npm dependencies
npm install

# Build packages
npm run build
```

### Code linting and formatting

```bash
npm run fmt
```
