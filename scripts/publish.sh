#!/bin/bash
set -e

npm ci
npm run build


for packageDir in packages/*; do
  if [ -d "$packageDir" ]; then
    PACKAGE_NAME=$(cat "$packageDir/package.json" | jq -r '.name')
    PUBLISH_VERSION=$(cat "$packageDir/package.json" | jq -r '.version')
    echo "Publishing ${PACKAGE_NAME}@${PUBLISH_VERSION}"
  fi
done

ref=$1
TAG=""
if [[ "$ref" == *"buildnet"* ]]; then
  TAG="--tag buildnet"
elif [[ "$ref" == *"testnet"* ]]; then
  TAG="--tag testnet"
fi

npm publish --workspace --access public $TAG