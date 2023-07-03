#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const as_gen_1 = require("./as-gen");
const ts_gen_1 = require("./ts-gen");
const protobuf_1 = require("./protobuf");
const massa_web3_1 = require("@massalabs/massa-web3");
const commander_1 = require("commander");
const dotenv = __importStar(require("dotenv"));
// Load .env file content into process.env
dotenv.config();
const program = new commander_1.Command();
program
    .option('-g, --gen <mode>', 'the generation mode for contracts callers (sc) or web3 app (web3)', 'sc')
    .option('-a, --addr <value>', 'the public address of the contract to interact with', '')
    .option('-o, --out <path>', 'optional output directory for the callers to generate', './helpers/')
    .parse();
// Get the URL for a public JSON RPC API endpoint from the environment variables
const publicApi = process.env.JSON_RPC_URL_PUBLIC;
if (!publicApi) {
    throw new Error('Missing JSON_RPC_URL_PUBLIC in .env file');
}
// Get the secret key for the wallet to be used for the deployment from the environment variables
const secretKey = process.env.WALLET_SECRET_KEY;
if (!secretKey) {
    throw new Error('Missing WALLET_SECRET_KEY in .env file');
}
// Create an account using the private key
/**
 * Massa-Proto-Cli program entry point.
 *
 * @param arguments - arguments.
 */
async function run() {
    const args = program.opts();
    let files = [];
    let mode = args['gen'];
    let address = args['addr'];
    let out = args['out'];
    if (mode === '' || address === '') {
        program.help();
        return 1;
    }
    const deployerAccount = await massa_web3_1.WalletClient.getAccountFromSecretKey(secretKey);
    const client = await massa_web3_1.ClientFactory.createCustomClient([
        { url: publicApi, type: massa_web3_1.ProviderType.PUBLIC },
        // This IP is false but we don't need private for this script so we don't want to ask one to the user
        // but massa-web3 requires one
        { url: publicApi, type: massa_web3_1.ProviderType.PRIVATE },
    ], true, deployerAccount);
    // call sc client to fetch protos
    const mpFiles = await client
        .smartContracts()
        .getProtoFiles([address], out);
    // call proto parser with fetched files
    for (const mpfile of mpFiles) {
        let protoFile = await (0, protobuf_1.getProtoFunction)(mpfile.filePath);
        files.push(protoFile);
    }
    // call the generator
    if (mode === 'sc') {
        (0, as_gen_1.generateAsCallers)(files, address, out);
    }
    else if (mode === 'web3') {
        (0, ts_gen_1.generateTsCallers)(files, out, address);
    }
    else {
        throw new Error(`Unsupported mode: ${mode}`);
    }
}
run();
//# sourceMappingURL=index.js.map