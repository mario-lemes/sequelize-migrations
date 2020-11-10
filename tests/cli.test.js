const { version } = require('../package.json');
const expect = require('chai').expect;
const cmd = require('./cmd');
const { EOL } = require('os');

describe('CLI', () => {
  it('should print the package version', async () => {
    const response = await cmd.execute(
      'bin/makemigration.js',
      ['--vers'],
      process,
    );

    expect(response.trim().split(EOL)).to.deep.equal([version]);
  });

  it('should print the correct error', async () => {
    try {
      const response = await cmd.execute(
        'bin/makemigration.js',
        ['--sausage'],
        process,
      );
    } catch (err) {
      expect(err.trim()).to.equal("error: unknown option '--sausage'");
    }
  });

  it('should require an external module to be executed first', async () => {
    try {
      const response = await cmd.execute(
        'bin/makemigration.js',
        ['--require', 'dotenv/config', 'dotenv_config_path=tests/.env'],
        process,
      );

      //expect(response.trim().split(EOL)).to.deep.equal([version]);
    } catch (err) {
      console.log(err);
    }
  });
});
