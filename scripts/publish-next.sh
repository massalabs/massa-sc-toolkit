#!/bin/bash
set -e

npm ci
npm run build

TAG=next

# Update the version with a premajor, preid next, no git tag, and no commit hooks
npm version --ws --preid $TAG --no-git-tag-version --no-commit-hooks premajor

TIME=$(date -u +%Y%m%d%H%M%S)
sed -i "/version/s/$TAG.0/$TAG.$TIME/g" packages/*/package.json

for packageDir in packages/*; do
  if [ -d "$packageDir" ]; then
    PACKAGE_NAME=$(cat "$packageDir/package.json" | jq -r '.name')
    PUBLISH_VERSION=$(cat "$packageDir/package.json" | jq -r '.version')
    echo "Publishing ${PACKAGE_NAME}@${PUBLISH_VERSION}"
  fi
done

npm publish --ws --access public --tag ${TAG}