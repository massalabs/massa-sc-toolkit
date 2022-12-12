import fs from "fs";
import asc from "assemblyscript/dist/asc";
import { checkWasmFile } from "./deployer";

const injectSC = (scFilePath: string): string => {
    const deployer = fs.readFileSync("./deployer/deployer.as.ts", "utf-8");
    return deployer.replace("##Wasm_file_path##", scFilePath);
};

const injectInit = (deployer: string): string => {
    const initFile = "./assembly/init.ts";
    if (fs.existsSync(initFile)) {
        const init = fs.readFileSync("./assembly/init.ts", "utf-8");
        return deployer.replace("//##init_function##", init).replace("//##init_call##", "init(contractAddr);");
    } else {
        return deployer.replace("//##init##", "").replace("//##init_call##", "");
    }
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
    // Inject SC in deployer contract
    const deployerStr = injectSC(scFilePath);
    // Inject init function in deployer contract
    const deployerStrInitialized = injectInit(deployerStr);
    // Build deployer contract
    await compileDeployer(deployerStrInitialized);
};

(async () => {
    let contractWasm = process.argv[2];
    if (!contractWasm) {
        contractWasm = "build/default.wasm";
    }
    try {
        checkWasmFile(contractWasm);
        console.log(`Compile deployer for smart contract: ${contractWasm}\n`);
        await buildDeployer(contractWasm);
    } catch (ex) {
        console.error(`Error compiling contract wasm file: ${contractWasm}. Error = ${(ex as Error).message}`);
    }
})();
