"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProtoFunction = void 0;
const protobufjs_1 = require("protobufjs");
const fs_1 = require("fs");
/**
 * Retrieve all the function's data and return them as an ProtoFile
 *
 * @param protoPath - the path to the proto file
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
    if (messageNames.length !== 2) {
        throw new Error('Error: the protoFile should contain 2 messages.');
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
    const rHelperKeys = Object.keys(rHelper.fields);
    const resType = rHelperKeys.length === 1 ? rHelper.fields[rHelperKeys[0]].type : 'void';
    const funcName = messageNames[0].replace(/Helper$/, '');
    const protoData = await fs_1.promises.readFile(protoPath, 'utf8').catch((error) => {
        throw new Error('Error while reading the proto file: ' + error);
    });
    return { argFields, funcName, resType, protoData, protoPath };
}
exports.getProtoFunction = getProtoFunction;
//# sourceMappingURL=protobuf.js.map