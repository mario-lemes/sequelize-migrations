const path = require('path'),
  fs = require('fs');

module.exports = function (options) {
  let sequelizercConfigs = [],
    sequelizercPath = path.join(process.env.PWD, '.sequelizerc');

  if (fs.existsSync(sequelizercPath)) {
    sequelizercConfigs = require(sequelizercPath);
  }

  if (!process.env.PWD) {
    process.env.PWD = process.cwd();
  }

  let migrationsDir = path.join(process.env.PWD, 'migrations'),
    modelsDir = path.join(process.env.PWD, 'models');

  if (options.migrationsPath) {
    migrationsDir = path.join(process.env.PWD, options.migrationsPath);
  } else if (sequelizercConfigs['migrations-path']) {
    migrationsDir = sequelizercConfigs['migrations-path'];
  }

  if (options.modelsPath) {
    modelsDir = path.join(process.env.PWD, options.modelsPath);
  } else if (sequelizercConfigs['models-path']) {
    modelsDir = sequelizercConfigs['models-path'];
  }

  return {
    migrationsDir: migrationsDir,
    modelsDir: modelsDir,
  };
};
