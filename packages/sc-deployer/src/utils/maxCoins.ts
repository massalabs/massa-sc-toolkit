import { ISCData } from '../interfaces';
import {
  BASE_ACCOUNT_CREATION_COST,
  STORAGE_BYTE_COST,
} from '@massalabs/massa-web3';
/**
 * Estimates the value of the maxCoins maximum number of coins to that should be used while deploying a smart contract.
 *
 * @param contractByteCode - The byte code of the smart contract to be deployed.
 * @param coinsSent - The coins sent during the deployment.
 *
 * @returns The calculated value of the maxCoins value in the smallest massa unit.
 */
export function calculateMaxCoins(
  contractByteCodeSize: bigint,
  coinsSent: bigint,
) {
  return (
    BASE_ACCOUNT_CREATION_COST +
    contractByteCodeSize * STORAGE_BYTE_COST +
    coinsSent
  );
}

/**
 * Calculate the bytecode size of a list of smart-contracts.
 *
 * @param contracts - The list of smart-contracts to be deployed.
 *
 * @returns The total bytecode size of the smart-contracts.
 *
 */
export function calculateBytecodeSize(contracts: ISCData[]): bigint {
  return contracts.reduce(
    (acc, contract) => acc + BigInt(contract.data.length),
    0n,
  );
}

/**
 * Calculate the total amount of coins sent at the deployment.
 *
 * @param contracts - The list of smart-contracts to be deployed.
 *
 * @returns The total amount of coins to be used for deploying the smart-contracts.
 *
 */
export function calculateCoinsSent(contracts: ISCData[]): bigint {
  return contracts.reduce((acc, contract) => acc + contract.coins, 0n);
}
