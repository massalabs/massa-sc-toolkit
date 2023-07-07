# Massa-Proto-CLI

Massa-Proto-CLI is a tool designed to generate callable functions for smart contract methods in TypeScript and AssemblyScript.
These generated functions can be seamlessly integrated within your smart contracts from TypeScript or AssemblyScript projects.

## Getting Started

### Prerequisites
Ensure you have npm installed on your machine to run the necessary commands.

For AssemblyScript (AS) smart contract caller generation, run:

```bash
npm i as-proto as-proto-gen @massalabs/massa-as-sdk @massalabs/as-types @massalabs/as-transformer
```

For TypeScript (TS) web3 caller generation, run:

```bash
npm i @protobuf-ts/plugin
```


### Installation
TODO

## Usage

### Setup
Firstly, create a .env file in your node project with the following variables:

```toml
JSON_RPC_URL_PUBLIC=your_node_url
```
You can use either of the following:

- Buildnet: `https://buildnet.massa.net/api/v2:33035`
- Testnet: `https://testnet.massa.net/api/v2:33035`
- Your own node

### Running the CLI
To see the list of available commands, use:

```bash
npx massa-proto --help
```

To generate callers, use:

```bash
npx massa-proto --addr=the_contract_address --gen=mode --out=outputDirectory
```

- `--addr` should be followed by the contract address you wish to generate your callers for.
- `--gen` should be followed by the generation mode: `sc` for contract-to-contract callers and `web3` for TypeScript to contract generation.
- `--out` should be followed by the path to the directory in which the callers will be generated.

### Utilizing Generated Callers
The generated callers for TypeScript and AssemblyScript offer a simple interface for interacting with your smart contract methods.

This is demonstrated through the example of a simple smart contract having only one function:

```typescript
sum(a: i64, b: i64): i64
```

#### TypeScript
To use the generated caller, import the function and call it as shown below:

```typescript
import { sum } from "./sumCaller.ts"

// Assume that you've already set up your callSC method in the caller using massa-web3 or the wallet-provider
console.log("a + b = ", await sum(a, b, coins));
```

#### AssemblyScript

To use the generated caller, import the function and call it as shown below:

```assemblyscript
import { sum } from "./sumCaller.ts"
import { generateEvent } from '@massalabs/massa-as-sdk';

export function main(_: StaticArray<u8>): void {
  generateEvent(`2 + 3 = {sum(2, 3)}`);
}
```

Note:
- Make sure to set the --out argument to a directory inside `/assembly/contracts/`
- In the package.json file, add the "-r" option after the compiler command for the "build" script 

## Contributing
Contributions are always welcome! If you would like to contribute to Massa-Proto-cli, please read our [Contributing Guidelines](https://github.com/massalabs/massa-sc-toolkit/blob/main/CONTRIBUTING.md).