import { load } from "protobufjs"; 

export const protoFilePath: string = "./src/proto/";
export const helperFilePath: string = "./generated";

export interface IProtoFile {
    argPath: string; // argPath: chemin vers le fichier helper généré pour les args
    resPath: string; // res : meme chose pour les returns
    argFields: Map<string, string>; // args fields : Mapping argument name -> argument type (string string)
    funcName: string;
    resType: string; // resType: type du retour
    fileData: string;
    argProtoData: string;
    resProtoData: string;
}


export async function getProtoFunctions(protoFileName: string, argPath?: string, resPath?: string): Promise<IProtoFile[]> {

    const root = await load(protoFilePath + protoFileName);
    // convert root to JSON
    const json = root.toJSON();
    
    let protoFunctions: IProtoFile[] = [];

    for (const key in json.nested) {
        // if the key name ends with "Helper", it's a function
        if (key.endsWith("RHelper") && protoFunctions.length > 0 ) {

            // check if the function name is the same as the previous one
            if (protoFunctions[protoFunctions.length - 1].funcName != key.slice(0, -7)) {
                console.log("expected: ", protoFunctions[protoFunctions.length - 1].funcName);
                console.log("got: ", key.slice(0, -7));
                throw new Error("Error: {func}RHelper should be placed after {func}Helper in the protoFile.\n Their name do not match. Error at message " + key);
            }

            let protoFunction: IProtoFile = protoFunctions[protoFunctions.length - 1];

            const keys = Object.keys(json.nested[key][`fields`]);
            if(keys.length == 1) {
                protoFunction.resType = json.nested[key][`fields`][keys[0]].type;
            } else if (keys.length == 0) {
                protoFunction.resType = "void";
            } else {
                throw new Error("Error: {func}RHelper should have only one field. Error at message " + key);
            }

        } else if (key.endsWith("RHelper") && protoFunctions.length <= 0) {
            throw new Error("Error: {func}Helper should be placed before {func}RHelper in the protoFile. Error at message " + key);
        
        } else if (key.endsWith("Helper")) {
            // get the arguments
            let argFields = new Map<string, string>();
            for (const arg in json.nested[key][`fields`]) {
                const name: string = arg;
                const type: string = root.nested[key][`fields`][arg].type;
                argFields.set(name, type);
            }

            let protoFunction: IProtoFile = {
                argPath: argPath,
                resPath: resPath,
                argFields: argFields, 
                funcName: key.slice(0, -6), // cut the last 6 characters (Helper) to get the initial name of the function
                resType: "", 
                fileData: "", // ????
                argProtoData: "", // ???
                resProtoData: "", // ???
            };
            protoFunctions.push(protoFunction);
        } else {
            throw new Error("Error: all functions name in the protoFile should end with 'Helper' or 'RHelper'. Error at message " + key);
        }
        
    }
    return protoFunctions;
}

