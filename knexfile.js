const { DATABASE_HOST, DATABASE_PASSWORD, DATABASE_USER, DATABASE_PORT } = require("./src/config");


const config = {
  development: {
    client: 'mysql2',
    connection: {
      host: DATABASE_HOST,
      user: DATABASE_USER,
      password: DATABASE_PASSWORD,
      database: 'txn-db',
      port: DATABASE_PORT,
    },
    migrations: {
      tableName: 'txn-migrations',
      directory: 'migrations',
    },

    seeds: {
      directory: 'seeds'
    }
  },
}

module.exports = { config }