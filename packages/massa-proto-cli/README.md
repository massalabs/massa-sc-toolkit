# Massa-Proto-CLI

Massa-Proto-CLI is a powerful tool that automates the generation of callable functions for smart contract methods in TypeScript and AssemblyScript. These generated functions can be seamlessly integrated into your smart contracts from TypeScript or AssemblyScript projects, saving you time and effort.

## Getting Started

### Prerequisites
Before using Massa-Proto-CLI, make sure you meet the following prerequisites:

- Familiarity with Massa smart contract development and deployment. You can refer to the [Massa smart contract documentation](https://docs.massa.net/en/latest/web3-dev/smart-contracts.html) for guidance.

- Understanding of the [Protobuf transformer](https://protobuf.dev/).


Additionally, ensure that you have npm installed on your machine to run the necessary commands.

### Installation

To install Massa-Proto-CLI, open your terminal and run the following command:

```bash
npm i -g @massalabs/massa-proto-cli
```

Depending on whether you're using AssemblyScript (AS) or TypeScript (TS) for smart contract caller generation, you'll need to install the corresponding dependencies:

- For AssemblyScript (AS) smart contract caller generation, run:

```bash
npm i as-proto as-proto-gen @massalabs/massa-as-sdk @massalabs/as-types @massalabs/as-transformer
```

- For TypeScript (TS) web3 caller generation, run:

```bash
npm i @protobuf-ts/plugin
```

### Setup
After installation, create a .env file in your node project with the following variable:

```toml
JSON_RPC_URL_PUBLIC=your_node_url
```

You can use one of the following URLs:

- Buildnet: `https://buildnet.massa.net/api/v2:33035`
- Testnet: `https://testnet.massa.net/api/v2:33035`
- Your own custom node URL

### Running the CLI
To view the list of available commands, use the following command:

```bash
npx massa-proto --help
```

To generate callers, use the following command:

```bash
npx massa-proto --addr=the_contract_address --gen=mode --out=outputDirectory
```

- `--addr` should be followed by the contract address for which you want to generate callers.
- `--gen` should be followed by the generation mode: sc for contract-to-contract callers and web3 for TypeScript to contract generation.
- `--out` should be followed by the path to the directory where the callers will be generated.

### Utilizing Generated Callers
The generated callers for TypeScript and AssemblyScript provide a simple interface for interacting with your smart contract methods. 
Let's consider an example with a simple smart contract containing only one function:

```protobuf
syntax = "proto3";

message sumHelper {
  int64 a = 1;
  int64 b = 2;
}

message sumRHelper {
  int64 value = 1;
}

```

#### TypeScript
To use the generated caller in TypeScript, import the function and call it as shown below:

```typescript
import { sum } from "./sumCaller.ts"

// Assume that you've already set up your callSC method in the caller using massa-web3 or the wallet-provider
console.log("a + b = ", await sum(a, b, coins));
```

#### AssemblyScript

To use the generated caller in AssemblyScript, import the function and call it as shown below:

```assemblyscript
import { sum } from "./sumCaller.ts"
import { generateEvent } from '@massalabs/massa-as-sdk';

export function main(_: StaticArray<u8>): void {
  generateEvent(`2 + 3 = {sum(2, 3)}`);
}
```

## Contributing
Contributions to Massa-Proto-CLI are always welcome! If you would like to contribute, please read our [Contributing Guidelines](https://github.com/massalabs/massa-sc-toolkit/blob/main/CONTRIBUTING.md)for more information.