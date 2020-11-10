#!/usr/bin/env node
const { version } = require('../package.json');
const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const { Command } = require('commander');
const beautify = require('js-beautify').js_beautify;

let migrate = require('../lib/migrate');
let pathConfig = require('../lib/pathconfig');
const { requireOrImport } = require('../lib/esm-utils');

(async () => {
  const program = new Command();

  program
    .version(
      version,
      '-v, --vers',
      'Current version of sequelize-migrations-generator',
    )
    .description('Generate migrations based on models definition')
    .option(
      '-r, --require <value...>',
      'Pass a dependency that should be executed before',
    )
    .option(
      '-p, --preview',
      'Show migration preview (does not change any files)',
    )
    .option(
      '-n, --migration-name <value>',
      'Set migration name (default: "noname")',
      'noname',
    )
    .option('-c, --comment <value>', 'Set migration comment')
    .option('-x, --execute', 'Create new migration and execute it')
    .option('--migrations-path <value>', 'The path to the migrations folder')
    .option('--models-path <value>', 'The path to the models folder');

  program.parse(process.argv);

  // Windows support
  if (!process.env.PWD) {
    process.env.PWD = process.cwd();
  }

  // Check dependencies
  if (program.require) {
    const [module, ...argvs] = program.require;
    await requireOrImport(module, argvs);
  }

  const { migrationsDir, modelsDir } = pathConfig(program);

  if (!fs.existsSync(modelsDir)) {
    console.log(
      "Can't find models directory. Use `sequelize init` to create it",
    );
    return;
  }

  if (!fs.existsSync(migrationsDir)) {
    console.log(
      "Can't find migrations directory. Use `sequelize init` to create it",
    );
    return;
  }

  // current state
  const currentState = {
    tables: {},
  };

  // load last state
  let previousState = {
    revision: 0,
    version: 1,
    tables: {},
  };

  try {
    previousState = JSON.parse(
      fs.readFileSync(path.join(migrationsDir, '_current.json')),
    );
  } catch (e) {}

  //console.log(path.join(migrationsDir, '_current.json'), JSON.parse(fs.readFileSync(path.join(migrationsDir, '_current.json') )))
  let sequelize = require(modelsDir).sequelize;

  let models = sequelize.models;

  currentState.tables = migrate.reverseModels(sequelize, models);

  let actions = migrate.parseDifference(
    previousState.tables,
    currentState.tables,
  );

  // sort actions
  migrate.sortActions(actions);

  let migration = migrate.getMigration(actions);

  if (migration.commandsUp.length === 0) {
    console.log('No changes found');
    process.exit(0);
  }

  // log migration actions
  _.each(migration.consoleOut, (v) => {
    console.log('[Actions] ' + v);
  });

  if (program.preview) {
    console.log('Migration result:');
    console.log(
      beautify('[ \n' + migration.commandsUp.join(', \n') + ' \n];\n'),
    );
    process.exit(0);
  }

  // backup _current file
  if (fs.existsSync(path.join(migrationsDir, '_current.json')))
    fs.writeFileSync(
      path.join(migrationsDir, '_current_bak.json'),
      fs.readFileSync(path.join(migrationsDir, '_current.json')),
    );

  // save current state
  currentState.revision = previousState.revision + 1;
  fs.writeFileSync(
    path.join(migrationsDir, '_current.json'),
    JSON.stringify(currentState, null, 4),
  );

  // write migration to file
  let info = migrate.writeMigration(
    currentState.revision,
    migration,
    migrationsDir,
    program.name ? program.name : 'noname',
    program.comment ? program.comment : '',
  );

  console.log(
    `New migration to revision ${currentState.revision} has been saved to file '${info.filename}'`,
  );

  if (program.execute) {
    migrate.executeMigration(
      sequelize.getQueryInterface(),
      info.filename,
      0,
      (err) => {
        if (!err) console.log('Migration has been executed successfully');
        else console.log('Errors, during migration execution', err);
        process.exit(0);
      },
    );
  } else process.exit(0);
})();
