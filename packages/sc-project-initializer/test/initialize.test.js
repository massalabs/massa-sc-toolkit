import { initialize } from '../src/initialize.js';
import { execSync } from 'child_process';
import { expect, it, describe, beforeEach } from '@jest/globals';
import * as fs from 'fs';
import * as fse from 'fs-extra';

jest.mock('child_process');
jest.mock('fs');
jest.mock('fs-extra');
jest.mock('path');

describe('initialize', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods
    fs.existsSync.mockClear();
    fs.mkdirSync.mockClear();
    fse.copySync.mockClear();
    execSync.mockClear();
    fs.renameSync.mockClear();
    console.error.mockClear();
    console.log.mockClear();
  });

  it('should handle an existing directory', () => {
    fs.existsSync.mockReturnValue(true);
    initialize('existing_dir');
    expect(console.error).toHaveBeenCalledWith(
      'The project directory existing_dir already exists. Please choose another project name.',
    );
  });

  it('should handle a new directory', () => {
    fs.existsSync.mockReturnValue(false);
    initialize('new_dir');
    expect(fs.mkdirSync).toHaveBeenCalledWith('new_dir');
    expect(fse.copySync).toHaveBeenCalled();
    expect(execSync).toHaveBeenCalledWith('npm install', { cwd: 'new_dir' });
    expect(fs.renameSync).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Installation begun...');
    expect(console.log).toHaveBeenCalledWith(
      'Installation successfully completed',
    );
  });
});
