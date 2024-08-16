/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('transactions', function(table) {
      table.increments('id').primary(); 
      table.integer('senderId').unsigned().notNullable(); 
      table.integer('status').notNullable().defaultTo(0); 
      table.decimal('amount', 14, 2).notNullable(); 
      table.enu('transactionType', ['credit', 'debit']).notNullable(); 
      table.string('narration').nullable(); 
      table.decimal('balanceBefore', 14, 2).nullable();
      table.decimal('balanceAfter', 14, 2).nullable(); 
      table.timestamp('deleted_at').nullable(); 
      table.timestamp('createdAt').defaultTo(knex.fn.now()); 
      table.timestamp('updatedAt').defaultTo(knex.fn.now()); 
  

      table.foreign('senderId').references('id').inTable('users');
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.dropTable('transactions');
  };
  