export declare const tempProtoFilePath = "./build/";
/**
 * Represents a function in a proto file
 *
 * @see argFields - the arguments of the function as an array of IFunctionArguments
 * @see funcName - the name of the function
 * @see resType - the return type of the function
 * @see protoData - the path to the proto file
 */
export interface ProtoFile {
    argFields: FunctionArguments[];
    funcName: string;
    resType: string;
    protoData?: string;
    protoPath?: string;
}
/**
 * Represents an argument of a function
 *
 * @see name - the name of the argument
 * @see type - the type of the argument
 */
export interface FunctionArguments {
    name: string;
    type: string;
}
/**
 * Retrieve all the function's data and return them as an ProtoFile
 *
 * @param protoFilePath - the path to the proto file
 * @returns The ProtoFile containing the function, its arguments name, arguments type and its return type
 */
export declare function getProtoFunction(protoFilePath: string): Promise<ProtoFile>;
