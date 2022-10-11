#!/usr/bin/env node
"use strict";

import { initialize } from './initialize.js';

import _yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
const yargs = _yargs(hideBin(process.argv));

yargs.scriptName("massa-sc-toolkit")
    .usage('$0 [args]')
    .command('init [name]', 'Intialize a new Massa Smart Contract project.', (yargs) => {
        yargs.positional('name', {
            type: 'string',
            default: 'test',
            describe: 'the project name'
        })
    }, function (argv) {
        initialize(argv.name)
    })
    .demandCommand()
    .recommendCommands()
    .strict()
    .showHelpOnFail(true)
    .help()
    .alias('h', 'help')
    .argv;