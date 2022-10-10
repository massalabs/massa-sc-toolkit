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

Keep in mind that a lot of false positives will remains undetected by ESLint such as :

-   Closures
-   Spreads
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

## ... use a linter

It doesn't exist specific & well maintained Assemblyscript linter in the ecosystem.

As the Assemblyscript is written in Typescript files, the recommendation is to use a linter for Typescript.

The best maintained remains nowadays ESLint

-   Dependencies installation are taken into account at initialization script level.

-   A config file `.eslintrc.json` is copied automatically at root level in your generated project

Keep in mind that a lot of false positives will remains undetected by ESLint such as :

-   Closures
-   Spreads
