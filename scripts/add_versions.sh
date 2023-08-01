#!/bin/bash
set -ex

# npm dist-tag add "@massalabs/sc-project-initializer@0.3.0" buildnet
# npm dist-tag add "@massalabs/massa-sc-deployer@0.2.0" buildnet

npm dist-tag rm "@massalabs/sc-project-initializer@0.5.0" testnet
npm dist-tag rm "@massalabs/massa-sc-deployer@0.4.0" testnet