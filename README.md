# massa-sc-toolkit

This toolkit is meant to facilitate smart contract development.

PREREQUISITES :
- Node.js installed on your computer
- NPM installed on your computer

1. Repository Initialisation

Type this command in an empty repository where you wish to develop your smart contracts :

npx -p assemblyscript -c "npm install --save-dev @massalabs/massa-as-sdk | asinit . && rm -r tests/ index.html"

You now have your own AssemblyScript project setup, with Massa's sdk installed.