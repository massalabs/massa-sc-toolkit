import fs from "fs";
import asc from "assemblyscript/dist/asc";
import { checkWasmFile } from "./deployer";

const injectSC = (b64wasm: string): string => {
    const deployer = fs.readFileSync("./deployer/deployer.as.ts", "utf-8");
    return deployer.replace("##My_contract##", b64wasm);
};

const compileDeployer = async (deployer: string) => {
    await asc.main(["-o", "build/deployer.wasm", "deployer.ts"], {
        readFile: (name, _) => {
            if (name === "deployer.ts") {
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
    // Convert SC to base 64
    const b64wasm = fs.readFileSync(scFilePath, "base64");
    // Inject SC in deployer contract
    const deployerStr = injectSC(b64wasm);
    // Build deployer contract
    await compileDeployer(deployerStr);
};

let contractWasm = process.argv[2];
if (!contractWasm) {
    contractWasm = "build/index.wasm";
}

checkWasmFile(contractWasm);
console.log(`Compile deployer for smartcontract: ${contractWasm}\n`);
await buildDeployer(contractWasm);
