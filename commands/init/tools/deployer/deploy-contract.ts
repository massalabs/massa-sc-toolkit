import { checkWasmFile } from '../utils';
import { Deployer } from './deployer';

(async () => {
    let wasmFile = process.argv[2];
    if (!wasmFile) {
        wasmFile = './build/deployer.wasm';
    }
    try {
        checkWasmFile(wasmFile);
        console.log(`Deploying smart contract: ${wasmFile}\n`);
        const deployer = new Deployer();
        await deployer.init();
        await deployer.deployContract(wasmFile);
    } catch (ex) {
        console.error(`Error deploying wasm file: ${wasmFile}. Error = ${(ex as Error).message}`);
    }
})();
