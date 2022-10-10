"use strict";

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const DEV_DEPENDENCIES = [
    "assemblyscript",
    "@massalabs/massa-as-sdk",
    "eslint",
    "@typescript-eslint/eslint-plugin@latest",
    "@typescript-eslint/parser@latest",
    "eslint@latest",
];

export function initialize(directory) {
    console.log("Installation begun...");

    if (fs.existsSync(directory)) {
        console.error(
            `Project directory ${directory} already exist. Please chose another project name.`
        );
        return;
    }

    fs.mkdirSync(directory);

    const option = { cwd: path.join(process.cwd(), directory) };

    execSync("npm init -y", option);
    execSync("npm install --save-dev " + DEV_DEPENDENCIES.join(" "), option);
    execSync("npx asinit . -y", option);
    fs.rmSync(path.join(process.cwd(), directory, "index.html"));
    fs.rmSync(path.join(process.cwd(), directory, "tests"), {
        recursive: true,
        force: true,
    });

    const prettier = fs.readFileSync(".prettierrc");
    fs.writeFileSync(
        path.join(process.cwd(), directory, ".prettierrc"),
        prettier
    );

    const ESLint = fs.readFileSync(".eslintrc.json");
    fs.writeFileSync(
        path.join(process.cwd(), directory, ".eslintrc.json"),
        ESLint
    );

    console.log("Installation successfully completed");
}
