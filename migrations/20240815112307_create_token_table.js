/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('tokens', function(table) {
      table.increments('id').primary(); // Primary key
      table.integer('userId').unsigned().notNullable(); // Foreign key
      table.string('token').notNullable();
      table.timestamp('expires_at', { precision: 6 }).nullable(6);
      table.timestamp('created_at', { precision: 6 }).defaultTo(knex.fn.now(6));
      table.timestamp('updated_at', { precision: 6 }).defaultTo(knex.fn.now(6));
      table.timestamp('deleted_at').nullable();
  
      // Foreign key constraint
      table.foreign('userId').references('id').inTable('users');
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.dropTable('tokens');
  };
  