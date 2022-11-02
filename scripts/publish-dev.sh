#!/bin/bash
set -e

source ./scripts/enable-git-ssh.sh
set-git-ssh

npm version --preid dev --no-git-tag-version --no-commit-hooks prepatch
#Use timestamp as package suffix
TIME=$(date -u +%Y%m%d%H%M%S)
sed -i "/version/s/dev.0/dev.$TIME/g" package.json
PUBLISH_VERSION=$(cat package.json | jq -r '.version')
echo publishing @massalabs/massa-sc-toolkit@$PUBLISH_VERSION
npm publish --access public --tag dev

