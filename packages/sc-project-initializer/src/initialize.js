'use strict';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import fse from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Initialize a smart-contract project
 *
 * @param {string} directory name of the target directory
 */
export function initialize(directory) {
  console.log('Installation begun...');

  if (fs.existsSync(directory)) {
    console.error(
      `The project directory ${directory} already exists. Please choose another project name.`,
    );
    return;
  }

  fs.mkdirSync(directory);

  fse.copySync(path.join(dirname(__dirname), 'commands', 'init'), directory);

  execSync('npm install', { cwd: directory });

  // workaround for npm removing .gitignore file when fetching repo...
  // See: https://github.com/npm/npm/issues/3763
  fs.renameSync(
    path.join(directory, 'gitignore'),
    path.join(directory, '.gitignore'),
  );

  console.log('Installation successfully completed');
}
