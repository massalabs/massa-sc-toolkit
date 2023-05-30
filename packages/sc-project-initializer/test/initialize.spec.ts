import fs from 'fs';
import { initialize } from '../src/initialize.js';

// Mock console.error
console.error = jest.fn();

describe('initialize', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods
    jest.clearAllMocks();
  });

  it('should handle an existing directory', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    initialize('existing_dir');

    expect((console.error as jest.Mock).mock.calls[0][0]).toBe(
      'The project directory existing_dir already exists. Please choose another project name.'
    );
  });

  // it('should handle a new directory', () => {
  //   (fs.existsSync as jest.Mock).mockReturnValue(false);
  //   initialize('new_dir');
  //   expect(fs.mkdirSync).toHaveBeenCalledWith('new_dir');
  //   expect((fse.copySync as jest.Mock).mock.calls[0][0]).toBe('source_path');
  //   expect((fse.copySync as jest.Mock).mock.calls[0][1]).toBe('destination_path');
  //   expect(execSync).toHaveBeenCalledWith('npm install', { cwd: 'new_dir' });
  //   expect(fs.renameSync).toHaveBeenCalledWith('old_path', 'new_path');
  //   expect(console.log).toHaveBeenCalledWith('Installation begun...');
  //   expect(console.log).toHaveBeenCalledWith('Installation successfully completed');
  // });
});
