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
    "@massalabs/as",
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
    fs.writeFile(
        path.join(process.cwd(), directory, ".prettierrc"),
        fs.readFile(".prettierrc", (err) => {
            if (err) throw err;
        }),
        (err) => {
            if (err) throw err;
        }
    );

    fs.writeFile(
        path.join(process.cwd(), directory, ".eslintrc.json"),
        fs.readFile(".eslintrc.json", (err) => {
            if (err) throw err;
        }),
        (err) => {
            if (err) throw err;
        }
    );

    fs.writeFile(
        path.join(process.cwd(), directory, ".gitignore"),
        fs.readFile(".gitignore", (err) => {
            if (err) throw err;
        }),
        (err) => {
            if (err) throw err;
        }
    );

    fs.writeFile(
        path.join(process.cwd(), directory, ".gitignore"),
        fs.readFile(".gitignore", (err) => {
            if (err) throw err;
        }),
        (err) => {
            if (err) throw err;
        }
    );

    fs.mkdir(process.cwd() + "/" + directory + "/assembly/__test__", (err) => {
        if (err) throw err;
    });

    fs.writeFile(
        path.join(process.cwd(), directory, "/assembly/__test__/tester.d.ts"),
        "/// <reference types='tester/assembly/global' />",
        (err) => {
            if (err) throw err;
        }
    );

    fs.writeFile(
        path.join(process.cwd(), directory, "/assembly/example.ts"),
        fs.readFile("example.ts", (err) => {
            if (err) throw err;
        }),
        (err) => {
            if (err) throw err;
        }
    );

    fs.writeFile(
        path.join(
            process.cwd(),
            directory,
            "/assembly/__test__/example.spec.ts"
        ),
        fs.readFile("example.spec.ts", (err) => {
            if (err) throw err;
        }),
        (err) => {
            if (err) throw err;
        }
    );

    fs.readFile(
        path.join(process.cwd(), directory, "package.json"),
        function (err, data) {
            var json = JSON.parse(data);
            json.scripts.test =
                "npx astester --imports node_modules/massalabs/massa-as-sdk/astester.imports.js";

            fs.writeFile(
                path.join(process.cwd(), directory, "package.json"),
                JSON.stringify(json),
                (err) => {
                    if (err) throw err;
                }
            );
        }
    );

    console.log("Installation successfully completed");
}
