
import fs from 'fs';
import { checkWasmFile } from '../utils';
import { compile } from './compiler';

const injectSC = (scFilePath: string): string => {
    const deployer = fs.readFileSync('./tools/assembly/deployer.ts', 'utf-8');
    return deployer.replace('##Wasm_file_path##', scFilePath);
};

const compileDeployer = async (deployer: string) => {
    await compile(['-o', './build/deployer.wasm', '-t', './build/deployer.wat', 'deployer.ts'], {
        readFile: (name: string) => {
            if (name === 'deployer.ts') {
                return deployer;
            }
            if (fs.existsSync(name)) {
                return fs.readFileSync(name).toString();
            }
            return null;
        },
    });
};

const buildDeployer = async (scFilePath: string) => {
    // Inject SC in deployer contract
    const deployerStr = injectSC(scFilePath);
    // Build deployer contract
    await compileDeployer(deployerStr);
};

(async () => {
    let contractWasm = process.argv[2];
    if (!contractWasm) {
        contractWasm = 'build/main.wasm';
    }
    try {
        checkWasmFile(contractWasm);
        console.log(`Compile deployer for smart contract: ${contractWasm}\n`);
        await buildDeployer(contractWasm);
    } catch (ex) {
        console.error(`Error compiling contract wasm file: ${contractWasm}. Error = ${(ex as Error).message}`);
    }
})();