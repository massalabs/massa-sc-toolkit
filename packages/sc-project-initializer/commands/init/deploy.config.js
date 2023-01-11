import { Args } from "@massalabs/massa-web3";

export default {
    /**
     * Targets to deploy.
     */
    targets: [
        {
            name: "main",
            wasmFile: "build/main.wasm",
            args: new Args().addString("test")
        }
    ],
  };