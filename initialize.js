"use strict";

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { exampleContract } from "./examples/exampleContract.js";
import { exampleTest } from "./examples/exampleTest.js";
import { gitignore } from "./utils/gitignore.js";
import { prettier } from "./utils/prettier.js";
import { eslint } from "./utils/eslint.js";

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

    fs.writeFileSync(
        path.join(process.cwd(), directory, ".prettierrc"),
        prettier
    );

    fs.writeFileSync(
        path.join(process.cwd(), directory, ".eslintrc.json"),
        eslint
    );

    fs.writeFileSync(
        path.join(process.cwd(), directory, ".gitignore"),
        gitignore
    );

    fs.mkdir(process.cwd() + "/" + directory + "/assembly/__test__", (err) => {
        if (err) throw err;
    });

    fs.writeFileSync(
        path.join(process.cwd(), directory, "/assembly/__test__/tester.d.ts"),
        "/// <reference types='tester/assembly/global' />"
    );

    fs.writeFileSync(
        path.join(process.cwd(), directory, "/assembly/example.ts"),
        exampleContract
    );

    fs.writeFileSync(
        path.join(
            process.cwd(),
            directory,
            "/assembly/__test__/example.spec.ts"
        ),
        exampleTest
    );

    fs.readFileSync(
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
        },
        "utf8"
    );

    console.log("Installation successfully completed");
}
