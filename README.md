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

If you want for instance to create a smart contract factory you will need to include another compiled smart contract in your smart contract.

To do that you will need the file2base64.js file inside the dependency transfomer

to install it :

```jsx

npm i --save-dev https://gitpkg.now.sh/massalabs/as/transformer?591c682ad20b1e6ad82490d705397fe4163365e7
```

### Transformations

This transformer loads the given file, encodes it in base64 and then replace the call to fileToBase64 by the encoded content.

**Example:**

```jsx
export function main(_args: string): i32 {
  const bytes = fileToBase64("./build/sc.wasm"); // will read `build/sc.wasm`, will encode it in base64 and then put the result in a string used to initialize `bytes`.
  const sc_addr = create_sc(bytes);
  call(sc_addr, "advance", "", 0);
  generate_event("gol SC deployed at addr: " + sc_addr);
  return 0;
}
```

**Usage**

You can use this transformer by adding --transform transformer/file2base64.js to your asc command.

For instance, to compile assembly/my_sc.ts with this transformer you will execute:

```jsx
npx asc --transform transformer/file2base64.js assembly/my_sc.ts --target release --exportRuntime -o build/my_sc.wasm
```

If you want to export wat files in order to check what is inside your compiled contract you can add

-t to specifies the WebAssembly text output file (.wat).

for instance for the same example

```jsx
npx asc --transform transformer/file2base64.js assembly/my_sc.ts --target release --exportRuntime -o build/my_sc.wasm -t build/my_sc.wat
```

###
