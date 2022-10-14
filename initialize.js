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
    "@massalabs/as/assembly",
    "https://gitpkg.now.sh/massalabs/as/transformer?main",
    "https://gitpkg.now.sh/massalabs/as/tester?main",
    "@massalabs/massa-web3",
    "@types/node",
    "dotenv",
    "tslib",
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

    // Create ESLint & Prettier file
    fs.writeFileSync(
        path.join(process.cwd(), directory, ".prettierrc"),
        fs.readFileSync(".prettierrc")
    );

    fs.writeFileSync(
        path.join(process.cwd(), directory, ".eslintrc.json"),
        fs.readFileSync(".eslintrc.json")
    );

    fs.writeFileSync(
        path.join(process.cwd(), directory, ".gitignore"),
        fs.readFileSync(".gitignore")
    );

    write;

    fs.writeFileSync(
        path.join(process.cwd(), directory, ".gitignore"),
        fs.readFileSync(".gitignore")
    );

    fs.mkdirSync(process.cwd(), directory, "/assembly/__test__/");
    fs.writeFileSync(
        path.join(process.cwd(), directory, "/assembly/__test__/tester.d.ts"),
        "/// <reference types='tester/assembly/global' />"
    );

    fs.writeFileSync(
        path.join(
            process.cwd(),
            directory,
            "/assembly/__test__/example.spec.ts"
        ),
        fs.readFileSync("example.spec.ts")
    );

    console.log("Installation successfully completed");
}
