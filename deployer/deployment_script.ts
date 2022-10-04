import { Deployer } from './Deployer.js'

const deployer = new Deployer();

if (!process.argv[2] || process.argv[2] === '') {
    throw new Error("You must give a valid smart contract file path to the deployer.");
}

console.log("Smartcontract file path : " + process.argv[2] + "\n") 

// Deploy smart contract
await deployer.deployContract(process.argv[2]);