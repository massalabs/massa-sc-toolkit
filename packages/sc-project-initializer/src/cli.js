#!/usr/bin/env node
'use strict';

/**
 * This script serves as a command-line interface (CLI) tool for initializing a new Massa Smart Contract project.
 * It uses several external dependencies and follows a specific command structure provided by the 'yargs' package.
 */

import { initialize } from './initialize.js';

import _yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
const yargs = _yargs(hideBin(process.argv));

yargs
  .scriptName('sc-project-initializer')
  .usage('$0 [args]')
  .command(
    'init [name]',
    'Intialize a new Massa Smart Contract project.',
    (yargs) => {
      yargs.positional('name', {
        type: 'string',
        default: 'test',
        describe: 'the project name',
      });
    },
    function (argv) {
      initialize(argv.name);
    },
  )
  .demandCommand()
  .recommendCommands()
  .strict()
  .showHelpOnFail(true)
  .help()
  .alias('h', 'help').argv;
