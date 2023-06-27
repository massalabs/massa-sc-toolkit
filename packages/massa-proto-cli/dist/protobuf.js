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
exports.getProtoFunction = exports.tempProtoFilePath = void 0;
const protobufjs_1 = require("protobufjs");
const fs = __importStar(require("fs"));
exports.tempProtoFilePath = './build/';
/**
 * Retrieve all the function's data and return them as an ProtoFile
 *
 * @param protoFilePath - the path to the proto file
 * @returns The ProtoFile containing the function, its arguments name, arguments type and its return type
 */
async function getProtoFunction(protoFilePath) {
    // load the proto file
    const protoContent = await (0, protobufjs_1.load)(protoFilePath);
    // convert protoContent to JSON
    const protoJSON = protoContent.toJSON();
    const messageNames = Object.keys(protoJSON.nested);
    // check if the proto file contains 2 messages
    if (messageNames.length != 2) {
        throw new Error('Error: the protoFile should contain 2 messages.');
    }
    // get the Helper message
    const helperName = protoJSON.nested[messageNames[0]];
    // get the arguments of the Helper
    let argFields = [];
    for (const arg in helperName[`fields`]) {
        if (helperName[`fields`][arg]) {
            const name = arg;
            const type = helperName[`fields`][arg].type;
            argFields.push({ name, type });
        }
    }
    // get the RHelper message
    const rHelperName = protoJSON.nested[messageNames[1]];
    // get the return type from the RHelper
    const keys = Object.keys(rHelperName[`fields`]);
    let returnType = 'void';
    if (keys.length == 1) {
        returnType = rHelperName[`fields`][keys[0]].type;
    }
    const funcName = messageNames[0].replace(/Helper$/, '');
    // get the content of the .proto file
    let protoFileContent = '';
    fs.readFile(protoFilePath, 'utf8', (error, data) => {
        if (error) {
            console.error('Error reading the protoFile:', error);
            return;
        }
        protoFileContent = data;
    });
    return {
        argFields,
        funcName: funcName,
        resType: returnType,
        protoData: protoFileContent,
    };
}
exports.getProtoFunction = getProtoFunction;
//# sourceMappingURL=protobuf.js.map