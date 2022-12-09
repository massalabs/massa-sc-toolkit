import { readdir, readFileSync } from 'fs';
import { join } from 'path';
import { compile } from './compiler';

const dirToCompile = './assembly/contracts';

export async function compileAll() {
    readdir(dirToCompile, async function (err: NodeJS.ErrnoException | null, files: string[]) {
        if (err) {
            return console.log('Unable to read directory: ' + err);
        }

        // keep only files ending with `.ts`
        files = files.filter((file) => file.endsWith('.ts'));

        // sort the file: compile deployer contract after
        files.sort((contract) => {
            return readFileSync(join(dirToCompile, contract), 'utf-8').includes('fileToByteArray(') ? 1 : -1;
        });

        console.log(`${files.length} files to compile`);

        files.forEach(async (contract) => {
            await compile([
                '-o',
                join('build', contract.replace('.ts', '.wasm')),
                '-t',
                join('build', contract.replace('.ts', '.wat')),
                join(dirToCompile, contract),
            ]);
        });
    });
}

await compileAll();