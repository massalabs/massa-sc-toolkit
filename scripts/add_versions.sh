#!/bin/bash
set -ex
npm publish --workspace --access public --tag latest
# npm publish "@massalabs/massa-proto-cli"
# npm publish "@massalabs/massa-sc-deployer" 

# npm dist-tag add "@massalabs/sc-project-initializer@0.3.0" buildnet
# npm dist-tag add "@massalabs/massa-sc-deployer@1.1.1" latest

# npm dist-tag rm "@massalabs/sc-project-initializer@0.5.0" testnet
# npm dist-tag rm "@massalabs/massa-sc-deployer@0.4.0" testnet

