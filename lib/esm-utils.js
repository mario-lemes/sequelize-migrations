const path = require('path');
const url = require('url');

const formattedImport = async (file) => {
  if (path.isAbsolute(file)) {
    return import(url.pathToFileURL(file));
  }
  return import(file);
};
//
/**
 * requireOrImport(): Function to invoke external files required before
 * running the script
 *
 * Based on mocha package implementation:
 * https://github.com/mochajs/mocha/blob/b1f26e2955211003bdf1fd3f445a5c39c1235a81/lib/esm-utils.js
 *
 */
exports.requireOrImport = async (file, argvs) => {
  process.argv = argvs;

  if (path.extname(file) === '.mjs') {
    return formattedImport(file);
  }
  try {
    return require(file);
  } catch (err) {
    if (err.code === 'ERR_REQUIRE_ESM') {
      return formattedImport(file);
    } else {
      throw err;
    }
  }
};
