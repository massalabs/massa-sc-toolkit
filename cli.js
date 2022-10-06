#!/usr/bin/env node
"use strict";

import { initialize } from './initialize';

const yargs = require('yargs')
    .scriptName("massa-sc-toolkit")
    .usage('$0 [args]')
    .command('[name]', 'Intialize a new Massa Smart Contract project.', (yargs) => {
        yargs.positional('name', {
            type: 'string',
            default: 'test',
            describe: 'the project name'
        })
    }, function (argv) {
        initialize(argv.name)
    })
    .help()
    .alias('h', 'help')
    .argv;