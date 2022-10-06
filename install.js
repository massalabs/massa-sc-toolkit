const { execSync } = require("child_process");
const fs = require("fs");

const DEV_DEPENDENCIES = [
  "assemblyscript",
  "@massalabs/massa-as-sdk",
  "@massalabs/as",
];

console.log("Installation begun...");

execSync("npm init -y");
execSync("npm install --save-dev " + DEV_DEPENDENCIES.join(" "));
execSync("npx asinit . -y");
fs.rmSync("./index.html");
fs.rmSync("./tests", { recursive: true, force: true });

console.log("Installation successfully completed");
