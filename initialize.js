"use strict";

import { execSync } from 'child_process';
import * as fs from 'fs';

const DEV_DEPENDENCIES = ["assemblyscript", "@massalabs/massa-as-sdk"];

export function initialize(directory) {
    console.log("Installation begun...");

    if (fs.existsSync(dir)) {
        console.error(`Project directory {dir} already exist. Please chose another project name`);
        return;
    }

    fs.mkdirSync(dir);

    const option = { cwd: path.join(process.cwd(), dir) };

    execSync('npm init -y', option);
    execSync('npm install --save-dev ' + DEV_DEPENDENCIES.join(' '), option);
    execSync('npx asinit . -y', option);
    fs.rmSync('./index.html', option);
    fs.rmSync('./tests', { recursive: true, force: true, ...option });

    console.log("Installation successfully completed");
}