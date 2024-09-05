const { DATABASE_HOST, DATABASE_USER, DATABASE_PORT } = require("./src/config/index");


module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: DATABASE_HOST,
      user: DATABASE_USER,
      password: '',
      database: 'example',
      port: DATABASE_PORT,
    },
    migrations: {
      tableName: 'txn-migrations',
      directory: './migrations',
    },

    seeds: {
      directory: './seeds'
    }
  },
}

