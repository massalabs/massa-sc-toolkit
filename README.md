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

# How to …

## Include another smart contract inside a smart contract ?

You can follow the following documentation :

https://github.com/massalabs/as/tree/main/transformer

###
