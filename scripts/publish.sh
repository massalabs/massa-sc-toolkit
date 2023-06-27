#!/bin/bash
set -e

npm ci
npm run build

ref=$1
TAG=""
if [[ "$ref" == *"buildnet"* ]]; then
  TAG="--tag buildnet"
elif [[ "$ref" == *"testnet"* ]]; then
  TAG="--tag testnet"
fi

for packageDir in packages/*; do
  if [ -d "$packageDir" ]; then
    echo "Navigating to ${packageDir}"
    cd $packageDir

    PACKAGE_NAME=$(cat "package.json" | jq -r '.name')
    PUBLISH_VERSION=$(cat "package.json" | jq -r '.version')

    echo "Publishing ${PACKAGE_NAME}@${PUBLISH_VERSION}"
    
    npm publish --access public $TAG
    cd ../..
  fi
done
