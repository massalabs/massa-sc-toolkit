
interface IProtoFunction {
    argProto: string;
    resProto: string;
    argPath: string;
    resPath: string;
    argFields: string[];
    funcName: string;
}

function retreiveProtoFunctions(protoData: string, directory: string) : IProtoFunction[] {
    let protoFunctions: IProtoFunction[] = [];
    let functions = protoData.search("message \* {\n\*\n}\n");
    let argFunctions : string[] = [];
    let resFunctions: string[] = [];

    for (let func of functions) {
        if (func.includes("RHelper {"))
            resFunctions.push(func);
        else 
            argFunctions.push(func);
    }
    for (let argFunc of argFunctions) {
        let protoFunc : IProtoFunction = {argPath:"", argProto:"", resPath:"", resProto:"", argFields:[], funcName:""};
        let funcName = argFunc.search("message \*Helper").replace("message ", '');
        protoFunc.funcName = funcName;

        protoFunc.argFields = argFunc.search("\n\*;").map(arg => arg.split(' ')[1].replace(";\n", ''));
        protoFunc.argPath = path.join(directory, funcName + "Helper.ts");
        protoFunc.argProto = argFunc;
        
        for (let resFunc of resFunctions) {
            if (resFunc.includes(funcName)) {
                protoFunc.resPath = path.join(directory, funcName + "RHelper.ts");
                protoFunc.resProto = resFunc;
            }
        }
        protoFunctions.push(protoFunc);
    }
    return protoFunctions;
}
function generateSCCalls(protoData: string, address: string, outputDirectory: string) {
    let protocProcess = spawnSync('protoc', [
        `--plugin=protoc-gen-as=./node_modules/.bin/as-proto-gen`,
        `--as_out=${outputDirectory}`,
        `--as_opt=gen-helper-methods`,
        `--proto_path=./build`,
        protoData,
    ]);

    if (protocProcess.status !== 0) {
        console.error(
            `Failed to generate AS helpers code for ${protoData} with error: ${protocProcess.stderr}`,
        );
    }
    const functions = retreiveProtoFunctions(protoData, outputDirectory);

    for (let func of functions) {
        const argsImports = `import { encode${func.funcName}Helper } from './${func.funcName}Helper';\n`
        const resImports = `import { decode${func.funcName}RHelper, ${func.funcName}RHelper } from './${func.funcName}RHelper';\n`;
        const deps = 'import { call } from "@massalabs/massa-as-sdk";\n\n';

        let caller = `export function ${func.funcName}(${func.argFields.join(', ')}) {\n`;

        caller += `  const result = call("${address}", "${func.funcName}", encode${func.funcName}Helper(new ${func.funcName}Helper(${func.argFields.join(', ')})), 0);\n`;
        if (func.resProto) {
            caller += `  const response = new ${func.funcName}RHelper(decode${func.funcName}RHelper(result));\n\n`;
            caller += "  return response.value;\n";
        }
        else {
            caller += "\n  return result;\n";
        }
        caller += "}";
        writeFileSync(argsImports + resImports + deps + caller, path.join(outputDirectory, func.funcName + ".ts")); 
    }
}


function run(args: string) {

}