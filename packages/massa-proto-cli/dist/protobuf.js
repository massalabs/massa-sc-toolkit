"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProtoFiles = exports.getProtoFunction = void 0;
const massa_web3_1 = require("@massalabs/massa-web3");
const bytesArrayToString_1 = require("./utils/bytesArrayToString");
const fs_1 = require("fs");
const protobufjs_1 = require("protobufjs");
const path_1 = __importDefault(require("path"));
/**
 * Retrieve all the function's data and return them as an ProtoFile
 *
 * @param protoPath - the path to the proto file
 *
 * @returns The ProtoFile containing the function, its arguments name, arguments type and its return type
 */
async function getProtoFunction(protoPath) {
    const protoContent = await (0, protobufjs_1.load)(protoPath);
    const protoJSON = protoContent.toJSON();
    // protoJSON.nested shouldn't be undefined
    if (!protoJSON.nested)
        throw new Error('Error: nested is undefined. Please check your proto file.');
    const messageNames = Object.keys(protoJSON.nested);
    // check if the proto file contains 2 messages
    if (messageNames.length > 2) {
        throw new Error('Error: the protoFile should contain maximum 2 messages.');
    }
    // get the Helper message
    const helper = protoJSON.nested[messageNames[0]];
    // get the arguments of the Helper
    const argFields = Object.entries(helper.fields)
        .filter(([, value]) => value)
        .map(([name, field]) => ({
        name,
        type: field.type,
    }));
    const rHelper = protoJSON.nested[messageNames[1]];
    let resType;
    // if the rHelper.fields exists, get the return type
    try {
        const rHelperKeys = Object.keys(rHelper.fields);
        resType =
            rHelperKeys.length === 1 ? rHelper.fields[rHelperKeys[0]].type : 'void';
    }
    catch (e) {
        resType = 'void';
    }
    const funcName = messageNames[0].replace(/Helper$/, '');
    const protoData = await fs_1.promises.readFile(protoPath, 'utf8').catch((error) => {
        throw new Error('Error while reading the proto file: ' + error);
    });
    return { argFields, funcName, resType, protoData, protoPath };
}
exports.getProtoFunction = getProtoFunction;
/**
 * Get the proto file of the contracts from the Massa Blockchain.
 *
 * @param contractAddresses - An array of contract addresses (as strings)
 *
 * @returns A promise that resolves to the array of IProtoFiles corresponding
 * to the proto file associated with each contract or the values are null if the file is unavailable.
 */
async function getProtoFiles(contractAddresses, outputDirectory, providerUrl) {
    // prepare request body
    const requestProtoFiles = [];
    for (let address of contractAddresses) {
        requestProtoFiles.push({
            address: address,
            key: Array.from((0, massa_web3_1.strToBytes)(massa_web3_1.MASSA_PROTOFILE_KEY)),
        });
    }
    const body = {
        jsonrpc: '2.0',
        method: 'get_datastore_entries',
        params: [requestProtoFiles],
        id: 1,
    };
    // send request
    let response = null;
    try {
        response = await fetch(providerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        // parse response
        const json = await response.json();
        let protoFiles = [];
        // for each contract, get the proto files
        for (let contract of json.result) {
            if (!contract.final_value) {
                throw new Error('No proto file found');
            }
            const retrievedProtoFiles = (0, bytesArrayToString_1.bytesArrayToString)(contract.final_value); // converting the Uint8Array to string
            // splitting all the proto functions to make separate proto file for each functions
            const protos = retrievedProtoFiles.split(massa_web3_1.PROTO_FILE_SEPARATOR);
            // for proto file, save it and get the function name
            for (let protoContent of protos) {
                // remove all the text before the first appearance of the 'syntax' keyword
                const proto = protoContent.substring(protoContent.indexOf('syntax'));
                // get the function name from the proto file
                const functionName = proto
                    .substring(proto.indexOf('message '), proto.indexOf('Helper'))
                    .replace('message ', '')
                    .trim();
                // save the proto file
                const filepath = path_1.default.join(outputDirectory, functionName + '.proto');
                (0, fs_1.writeFileSync)(filepath, proto);
                const extractedProto = {
                    data: proto,
                    filePath: filepath,
                    protoFuncName: functionName,
                };
                protoFiles.push(extractedProto);
            }
        }
        return protoFiles;
    }
    catch (ex) {
        const msg = `Failed to retrieve the proto files.`;
        console.error(msg, ex);
        throw ex;
    }
}
exports.getProtoFiles = getProtoFiles;
//# sourceMappingURL=protobuf.js.map