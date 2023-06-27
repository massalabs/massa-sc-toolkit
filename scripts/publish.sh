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
    PACKAGE_NAME=$(cat "$packageDir/package.json" | jq -r '.name')
    PUBLISH_VERSION=$(cat "$packageDir/package.json" | jq -r '.version')
    
    # Check if the package name is in the reference
    if [[ "$ref" == *"$PACKAGE_NAME"* ]]; then
      echo "Publishing ${PACKAGE_NAME}@${PUBLISH_VERSION}"
      
      cd $packageDir
      npm publish --access public $TAG
      cd ../..
    else
      echo "Skipping ${PACKAGE_NAME}"
    fi
  fi
done
