#!/bin/bash
set -ex
cd ./packages/sc-deployer
# npm publish --access public
# npm publish "@massalabs/massa-proto-cli"
# npm publish "@massalabs/massa-sc-deployer" 

npm dist-tag add "@massalabs/sc-project-initializer@1.3.0" buildnet
npm dist-tag add "@massalabs/massa-sc-deployer@1.3.0" buildnet

npm dist-tag rm "@massalabs/sc-project-initializer@0.9.1-dev.20231121150119" buildnet-dev
npm dist-tag rm "@massalabs/massa-sc-deployer@0.8.1-dev.20231121150119" buildnet-dev

