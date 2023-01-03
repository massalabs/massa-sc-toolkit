#!/bin/bash
set -ex

npm version --ws --preid dev --no-git-tag-version --no-commit-hooks prepatch
TIME=$(date -u +%Y%m%d%H%M%S)
sed -i "/version/s/dev.0/dev.$TIME/g" packages/*/package.json
npm publish --ws --tag dev --access public --dry-run
