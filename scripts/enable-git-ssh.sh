#!/bin/bash

set-git-ssh () {
    if [[ -n "$CI" ]];then
        ssh -o StrictHostKeyChecking=no git@github.com || echo "connected"
        git config user.email "massa-sc-toolkit-ci@massa.net"
        git config user.name "massa-sc-toolkit-ci"
    fi
}


