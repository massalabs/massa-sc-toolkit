import { exec } from "child_process";
import { readdir, readFileSync } from "fs";

const dirToCompile = "assembly/contracts";

export async function compileAS() {
    readdir(dirToCompile, function (err: NodeJS.ErrnoException | null, files: string[]) {
        if (err) {
            return console.log("Unable to scan directory: " + err);
        }

        const filesFiltered = files.filter((file) => file.includes(".ts"));

        const filesOrdered = orderForCompilation(filesFiltered);
        console.log(`${filesOrdered} files to compile`);

        const command = prepareCommand(filesOrdered);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(error);
                return;
            }
            if (stderr) {
                console.log(stderr);
                return;
            }
            console.log("Compilation succeeds");
            return;
        });
    });
}

// Order files retrieved in the /contracts folder
function orderForCompilation(files: string[]) {
    const deployers: string[] = [];
    const fileOrdered: string[] = [];
    files.forEach(async (contract) => {
        const contractASContent = readFileSync(`${dirToCompile}/${contract}`, "utf-8");
        contractASContent.includes("fileToBase64(") ? deployers.push(contract) : fileOrdered.push(contract);
    });

    deployers.forEach((deployer) => {
        fileOrdered.push(deployer);
    });

    return fileOrdered;
}

function prepareCommand(filesOrdered: string[]) {
    let command = "";
    filesOrdered.forEach((file) => {
        const contractName = file.substring(0, file.length - 3);
        command += `npx asc ${dirToCompile}/${contractName}.ts --target release -o build/${contractName}.wasm && `;
    });
    return command.substring(0, command.length - 4);
}

await compileAS();
