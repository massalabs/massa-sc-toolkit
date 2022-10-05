# Build a smart Contrat

# Commands

To initialize a new Smart Contract project, you must execute the following command:

```bash
npm init
npm install --save-dev assemblyscript @massalabs/massa-as-sdk https://github.com/massalabs/as
npx asinit .
```

> All dependencies shall be installed as development depencies using the `--save-dev` argument.

# Details

## It starts with a NodeJS project

AssemblyScript projects are systematically included in NodeJS projects.

The first command to be executed, `npm init`, corresponds to the initialization of a NodeJS project.

> If you are not familiar with this type of project, you should know that most of the configuration is done in the **package.json** file.

## Dependencies

### AssemblyScript

To include AssemblyScript code in the Node project, `assemblyscript` package must be installed as development only dependencies.

Then to initialize the project, you should then run the command `npx asinit .`.

This will create:

- the proper directories (assembly, build)
- the proper configuration (creates `asconfig.json`, updates `package.json`)
- few other things to remove (`tests` directory, `index.html` file)

To remove that using linux, you can do:

```bash
rm -r tests/ index.html
```

### massa-as-sdk

To interact with the Massa blockchain, your SC will call ABI functions, a kind of [Foreign Function Interface (FFI)](https://en.wikipedia.org/wiki/Foreign_function_interface).

The AssemblyScript bridges to these functions, among other useful things, are included in the massa-as-sdk module develop by Massa Labs.

Therefore, if you need to interact with the Massa ledger or if you need one of the tools included in this package, you have to install this dependency.

## @massalabs/as

In complement with the massa-as-sdk you will need to incorporate @massalabs/as, this repo inlcudes the MassaLabs assemblyscript native implementations

## Librairies

To use librairies as massa-as-sdk and @massalabs/as you need to import the exporting file, for instance :

```jsx
import { generateEvent } from "@massalabs/massa-as-sdk/assembly/index";
export function HelloWorld(): void {
  generateEvent(`Hello World`);

```

# How to …

## test the procedure?

To test the procedure, you need to follow the next steps:

1. Create a new directory
2. Execute the [commands](https://www.notion.so/SC-Build-a-smart-Contrat-aeaa086fad0847b69debb66bc43c329d).
3. Install the dependencies with npm install
4. Generate the Wasm file executing `npm run asbuild`
5. Check that there is no error message and that the wasm files exist in the build directory.

## Include another smart contract inside smart contract ?

If you want for instance to create a smart contract factory you will need to include another compiled smart contract in your smart contract.

To do that you will need the file2base64.js file inside the dependency massalabs/as/transformer

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

You can use this transformer by adding --transform massalabs/as/transformer/file2base64.js to your asc command.

For instance, to compile assembly/my_sc.ts with this transformer you will execute:

```jsx
yarn asc --transform as/transformer/file2base64.js assembly/my_sc.ts --target release --exportRuntime -o build/my_sc.wasm
```

If you want to export wat files in order to check what is inside your compiled contract you can add

-t to specifies the WebAssembly text output file (.wat).

for instance for the same exemple

```jsx
yarn asc --transform as/transformer/file2base64.js assembly/my_sc.ts --target release --exportRuntime -o build/my_sc.wasm -t build/my_sc.wat
```

will export .d.ts, .js, .wasm, .map.wasm, .wat

###
