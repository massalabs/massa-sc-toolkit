#!/bin/bash
set -e

npm ci
npm run build

for packageDir in packages/*; do
  if [ -d "$packageDir" ]; then
    PACKAGE_NAME=$(cat "$packageDir/package.json" | jq -r '.name')
    PUBLISH_VERSION=$(cat "$packageDir/package.json" | jq -r '.version')
    
    echo "Publishing ${PACKAGE_NAME}@${PUBLISH_VERSION}"

    cd $packageDir
    npm publish --access public --tag latest
    cd ../..
  fi
done
