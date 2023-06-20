import { exec } from "child_process";
import { IProtoFile, IFunctionArguments, tempProtoFilePath } from "./protobuf.ts";

/**
 * Generates a helper function for a proto file to allow serialization/deserialization.
 * 
 * @param protoFile - The proto file data used to generate the serialization/deserialization.
 * @param helperFilePath - The path to save the helper file.
 */
export function generateTSHelper(protoFile: IProtoFile, helperFilePath: string): void{

    // generate a temporary proto file and write the content of protoFileContent in it
    const protoFileName = `${protoFile.funcName}.proto`;
    const fs = require('fs');
    fs.writeFile(tempProtoFilePath + protoFileName, protoFile, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        }
    });

    // generate the helper file using protoc. Throws an error if the command fails.
    exec(`npx protoc --ts_out="${helperFilePath}" ${tempProtoFilePath}${protoFileName}`, (error, stdout, stderr) => {
        if (error) {
            throw error;
        }
        if (stderr) {
            throw stderr;
        }
        console.log(stdout);
    });

    // delete the temporary proto file
    fs.unlink(tempProtoFilePath + protoFileName, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
        }
    }
    );
}




