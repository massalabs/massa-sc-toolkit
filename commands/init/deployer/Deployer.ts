import 'dotenv/config';
import {
	Client,
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
			secretKey: process.env.DEFAULT_WALLET_PRIVATE_KEY,
			publicKey: process.env.DEFAULT_WALLET_PUBLIC_KEY,
		} as IAccount;

		this.providers = [
			{
				url: 'https://inno.massa.net/test15',
				type: ProviderType.PUBLIC,
			} as IProvider,
			{
				url: process.env.JSON_RPC_URL + ':33038',
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

	/** Load and encode smart contract from a physical assemblyscript file */
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
		const compiledContract = this.loadSmartContractFromWasmFile(scFilePath);
		// Deploy SC & retrieve operation ID
		console.log("Deployment has begun...\n")
		let datastore = new Map<Uint8Array, Uint8Array>()
		datastore = datastore.set(new Uint8Array(Buffer.from("key")), new Uint8Array(Buffer.from("value")));

		const operationIdDeployDns = await this.web3Client.smartContracts().deploySmartContract(
			{
				coins: 0,
				fee: 0,
				gasPrice: 0,
				maxGas: 1_000_000_000,
				contractDataBase64: compiledContract.base64,
				contractDataBinary: compiledContract.binary,
				contractDataText: compiledContract.text,
				datastore: datastore
			},
			this.baseAccount
		);

		console.log(`Deployment successfully ended with operation id ${operationIdDeployDns[0]}\n`)
		console.log("Retrieving deployed contract address...\n")
		// Wait the end of deployment
		let found = false;

		while (!found) {
			const event = await this.web3Client.smartContracts().getFilteredScOutputEvents({
				emitter_address: null,
				start: null,
				end: null,
				original_caller_address: null,
				original_operation_id: operationIdDeployDns[0],
				is_final: null
			});
			if (event[0]) {
				found = true;
				console.log("First event is:");
				console.log(event[0].data);
			} else {
				await delay(5000);
			}
		}
	}
}