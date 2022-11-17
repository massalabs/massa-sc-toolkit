#!/bin/bash
set -e

TAG=$1
if [[ -z "$TAG" || ! "$TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Publish release error: Missing or invalid version tag $TAG"
    exit 1
fi

VERSION="${TAG:1}"
echo "VERSION" $VERSION

source ./scripts/enable-git-ssh.sh
set-git-ssh

echo publishing @massalabs/massa-sc-toolkit@$VERSION
npm publish --tag latest
