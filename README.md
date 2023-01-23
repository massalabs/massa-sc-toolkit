# Massa smart-contract toolkit

This repository is a monorepo for smart-contract development in AssemblyScript for Massa blockchain.

## Packages

### @massalabs/sc-project-initializer

sc-project-initializer (smart-contract project initializer), is a package that should be used as a first step when starting to develop smart contracts on Massa blockchain. It consists of the files necessary for setting up the environment for developing a smart-contract project.

- [Installation](./packages/sc-project-initializer/README.md)
- [Build your first smart-contract](./packages/sc-project-initializer/commands/init/README.md)

### @massalabs/sc-deployer

sc-deployer is a tool used for deploying your smart contracts on the Massa network:

- [sc-deployer](./packages/sc-deployer/README.md)

## Development setup

```bash
# Install npm dependencies
npm install

# Build packages
npm run build
```

## Code linting and formatting

```bash
npm run fmt
```
