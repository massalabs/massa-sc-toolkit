import { load } from "protobufjs"; 

export const tempProtoFilePath: string = "./build/";

/**
 * Represents a function in a proto file
 * 
 * @see argFields - the arguments of the function as an array of IFunctionArguments
 * @see funcName - the name of the function
 * @see resType - the return type of the function
 * @see protoData - the content of the proto file
 */
export interface ProtoFile {
    argFields: IFunctionArguments[];
    funcName: string;
    resType: string;
    protoData: string;
}

/**
 * Represents an argument of a function
 * 
 * @see name - the name of the argument
 * @see type - the type of the argument
 */
export interface IFunctionArguments {
    name: string;
    type: string;
}

/**
 * Retrieve all the function's data and return them as an ProtoFile
 * 
 * @param protoFileContent - the content of the proto file to parse
 * @returns The ProtoFile containing the function, its arguments name, arguments type and its return type
 */
export async function getProtoFunction(protoFileContent: string): Promise<ProtoFile> {
    
    // generate a temporary proto file and write the content of protoFileContent in it
    const protoFileName = "temp.proto";
    const fs = require('fs');
    fs.writeFile(tempProtoFilePath + protoFileName, protoFileContent, (err) => {
        if (err) {
          console.error('Error writing to file:', err);
        }
      });

    // load the proto file
    const protoContent = await load(tempProtoFilePath + protoFileName);
    // convert protoContent to JSON
    const protoJSON = protoContent.toJSON();
    
    const messageNames = Object.keys(protoJSON.nested);

    // check if the proto file contains 2 messages
    if (messageNames.length != 2) {
        throw new Error("Error: the protoFile should contain 2 messages.");
    }

    // get the Helper message
    const helperName = protoJSON.nested[messageNames[0]];
    // get the arguments of the Helper
    let argFields: IFunctionArguments[] = [];
        for (const arg in helperName[`fields`]) {
            const name: string = arg;
            const type: string = helperName[`fields`][arg].type;
            argFields.push ({name, type});
        }
    
    // get the RHelper message
    const rHelperName = protoJSON.nested[messageNames[1]];
    // get the return type from the RHelper
    const keys = Object.keys(rHelperName[`fields`]);
    let returnType = "void";
    if(keys.length == 1) {
        returnType = rHelperName[`fields`][keys[0]].type;
    }

    // delete the temporary proto file
    fs.unlink(tempProtoFilePath + protoFileName, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
        }
    });

    const funcName = messageNames[0].replace(/Helper$/, '');
    return {argFields, funcName: funcName, resType: returnType, protoData: protoFileContent};
}
