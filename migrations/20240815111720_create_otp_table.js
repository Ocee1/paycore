/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('otps', function(table) {
      table.increments('id').primary(); // Primary key
      table.integer('userId').unsigned().notNullable(); // Foreign key
      table.string('otp').notNullable();
      table.timestamp('expiresAt').notNullable();
      table.timestamp('createdAt', { precision: 6 }).defaultTo(knex.fn.now(6));
      table.timestamp('updatedAt', { precision: 6 }).defaultTo(knex.fn.now(6));
  
      // Foreign key constraint
      table.foreign('userId').references('id').inTable('users');
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.dropTable('otps');
  };
  