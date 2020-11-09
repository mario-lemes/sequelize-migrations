# sequelize-migrations

Migration generator and runner for sequelize

Forked from [sequelize-auto-migrations](https://github.com/flexxnn/sequelize-auto-migrations)

## Install

`npm install sequelize-migrations`

## Usage

### `makemigration [--options]`

- --name, -n <migration string>     'Set migration name (default: "noname")'
- --preview, -p                     'Show migration preview (does not change any files)'
- --comment, -c <comment string>    'Set migration comment'
- --execute, -x                     'Create new migration and execute it'
- --migrations-path <path string>   'The path to the migrations folder'
- --models-path <path string>       'The path to the models folder'
- --help                            'Show this message'

* Change models and run it again, model difference will be saved to the next migration

`makemigration` tool creates `_current.json` file in `migrations` dir, that is used to calculate difference to the next migration. Do not remove it!

Examples:
To create and then execute migration, use:
`makemigration --name <name> -x`

To preview new migration, without any changes, you can run:

`makemigration --preview`


### `runmigration [--options]`

- --rev, -r <revision number>       'Set migration revision (default: 0)'
- --pos, -p <position number>       'Run first migration at pos (default: 0)'
- --one                             'Do not run next migrations'
- --list, -l                        'Show migration file list (without execution)'
- --migrations-path <path string>   'The path to the migrations folder'
- --models-path <path string>       'The path to the models folder'
- --help                            'Show this message'

## TODO:

- Migration action sorting procedure need some fixes. When many foreign keys in tables, there is a bug with action order. Now, please check it manually (`--preview` option)
- Need to check (and maybe fix) field types: `BLOB`, `RANGE`, `ARRAY`, `GEOMETRY`, `GEOGRAPHY`
- Downgrade is not supported, add it
- This module tested with postgresql (I use it with my projects). Test with mysql and sqlite.
