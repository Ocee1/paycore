/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('webhooks', function(table) {
      table.increments('id').primary(); 
      table.string('session_id').notNullable(); 
      table.text('meta_data').notNullable(); 
      table.timestamp('expiresAt'); 
      table.timestamp('createdAt', { precision: 6 }).defaultTo(knex.fn.now(6)); 
      table.timestamp('updatedAt', { precision: 6 }).defaultTo(knex.fn.now(6)); 
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.dropTable('webhooks');
  };
  