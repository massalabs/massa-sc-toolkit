import 'dotenv/config';
import {
	Client,
	EOperationStatus,
	IAccount,
	IClientConfig,
	IProvider,
	ProviderType,
} from '@massalabs/massa-web3';
import fs from 'fs';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export class Deployer {
	baseAccount: IAccount;
	providers: Array<IProvider>;
	web3ClientConfig: IClientConfig;
	web3Client: Client;
	contractAddress: string | undefined;

	constructor() {
		this.baseAccount = {
			address: process.env.DEFAULT_WALLET_ADDRESS,
			secretKey: process.env.DEFAULT_WALLET_SECRET_KEY,
			publicKey: process.env.DEFAULT_WALLET_PUBLIC_KEY,
		} as IAccount;

		this.providers = [
			{
				url: 'https://inno.massa.net/test13',
				type: ProviderType.PUBLIC,
			} as IProvider,
			{
				url: process.env.JSON_RPC_URL + ':33034',
				type: ProviderType.PRIVATE,
			} as IProvider,
		];

		this.web3ClientConfig = {
			providers: this.providers,
			retryStrategyOn: true,
			periodOffset: 1,
		};

		this.web3Client = new Client(this.web3ClientConfig, this.baseAccount);

		this.contractAddress = process.env.DEFAULT_WALLET_ADDRESS;
	}

    /** compile smart contract from a physical assemblyscript file */
    loadSmartContractFromWasmFile(wasmFilePath: string) {
        if (!fs.existsSync(wasmFilePath)) {
            throw new Error(`Wasm contract file ${wasmFilePath} does not exist`);
        }
        const wasmFilePathStr = wasmFilePath.toString();
        const binaryArrayBuffer = fs.readFileSync(wasmFilePathStr, {});
        const binaryFileContents = new Uint8Array(binaryArrayBuffer);
        const base64 = Buffer.from(binaryFileContents).toString("base64");
        return {
            binary: binaryFileContents,
            text: undefined,
            base64
        };
    }

    async deployContract(scFilePath: string) {
        // Load contract
		const compiledContract = await this.loadSmartContractFromWasmFile(scFilePath);
		// Deploy SC & retrieve operation ID
		console.log("Deployment has begun...\n")

		const operationIdDeployDns = await this.web3Client.smartContracts().deploySmartContract(
			{
				coins: 0,
				fee: 0,
				gasPrice: 0,
				maxGas: 1_000_000_000,
				contractDataBase64: compiledContract.base64,
				contractDataBinary: compiledContract.binary,
				contractDataText: compiledContract.text,
			},
			this.baseAccount
		);

		console.log("Deployment successfully ended\n")
        console.log("Retrieving deployed contract address...\n")
		// Wait the end of deployment
		let a = false;

		while (!a) {
			const event = await this.web3Client.smartContracts().getFilteredScOutputEvents({
				emitter_address: null,
				start: null,
				end: null,
				original_caller_address: null,
				original_operation_id: operationIdDeployDns[0],
				is_final: null
			});
			if (event[0]) {
				a = true;
				this.contractAddress = event[0].data.split(':')[1];
			}
			await delay(5000);
		}
		a = false;

		console.log(`Contract address is : ${this.contractAddress}`);
    }
}