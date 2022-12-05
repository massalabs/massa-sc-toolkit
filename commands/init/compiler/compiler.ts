import { exec } from "child_process";
import { readdir, readFileSync } from "fs";
import { join } from "path";
const dirToCompile = "assembly/contracts";

export async function compileAS() {
    readdir(dirToCompile, function (err: NodeJS.ErrnoException | null, files: string[]) {
        if (err) {
            return console.log("Unable to scan directory: " + err);
        }

        const filesFiltered = files.filter((file) => file.includes(".ts"));

        const filesOrdered = orderForCompilation(filesFiltered);
        console.log(`${filesOrdered.length} files to compile`);

        const command = prepareCommand(filesOrdered);

        exec(command, (error, _, stderr) => {
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
    return files.sort(contract => {
        return readFileSync(join(dirToCompile, contract), "utf-8").includes("fileToBase64(") ? 1 : -1;
    });
}

function prepareCommand(filesOrdered: string[]): string {
    return filesOrdered
        .map((file) => `npx asc ${join(dirToCompile, file)} -o build/${file.replace(".ts", ".wasm")}`)
        .join(" && ");
}

await compileAS();
