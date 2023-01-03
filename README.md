# Massa smart-contract toolkit

This repository is a monorepo for smart-contract development in AssemblyScript for Massa blockchain.

## Build

```bash
# Install npm dependencies and packages (massa-sc-toolkit)
npm install

# Build massa-sc-compiler
npm run build --workspace=packages/sc-compiler 
npm run init

# This will install built massa-sc-compiler binary
npm install

# Build other packages
npm run build
```

## Code linting and formatting

```bash
npm run fmt
```
