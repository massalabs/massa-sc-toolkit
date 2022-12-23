import { Args, Client, ClientFactory, ProviderType, IAccount, WalletClient, IContractData, IProvider } from "@massalabs/massa-web3";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from 'url';

export interface ISCData {
    data: Uint8Array,
    args?: Args,
    coins: number,
}

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

async function deploySC(publicApi: string, account: IAccount, contracts: ISCData[], fee: number, maxGas: number) {
    const client: Client = await ClientFactory.createCustomClient(
        [
            {url: publicApi, type: ProviderType.PUBLIC} as IProvider, 
            // This IP is false but we don't need private for this script so we don't want to ask one to the user 
            // but massa-web3 requires one
            {url: publicApi, type: ProviderType.PRIVATE} as IProvider
        ],
        true,
        account
    );

    let datastore = new Map<Uint8Array, Uint8Array>();
    datastore.set(new Uint8Array([0x00]), new Uint8Array(new Args().addU64(BigInt(contracts.length)).serialize()));
    for (let i = 0; i < contracts.length; i++) {
        const contract = contracts[i];
        datastore.set(new Uint8Array(new Args().addU64(BigInt(i + 1)).serialize()), contract.data);
        if (contract.args) {
            datastore.set(new Uint8Array(new Args().addU64(BigInt(i + 1)).addUint8Array(new Uint8Array([0x00])).serialize()), new Uint8Array(contract.args.serialize()));
        }
        if (contract.coins > 0) {
            datastore.set(new Uint8Array(new Args().addU64(BigInt(i + 1)).addUint8Array(new Uint8Array([0x01])).serialize()), new Uint8Array(new Args().addU64(BigInt(contract.coins)).serialize()));
        }
    }

    let op_ids = await client.smartContracts().deploySmartContract({
        fee: fee,
        maxGas: maxGas,
        coins: contracts.reduce((acc, contract) => acc + contract.coins, 0),
        contractDataBinary: readFileSync(`${__dirname}/deployer.wasm`),
        datastore
    } as IContractData, account);
    console.log(`Your contracts has been deployed in operation: ${op_ids[0]}`);
}

export { Args, IAccount, WalletClient, deploySC }