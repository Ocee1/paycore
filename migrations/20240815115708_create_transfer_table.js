/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('transfers', function (table) {
      table.increments('id').primary(); // Primary key
      table.integer('transactionId').unsigned().notNullable(); 
      table.integer('status').notNullable().defaultTo(0);
      table.decimal('amount', 14, 2).notNullable(); 
      table.string('bank').notNullable();
      table.string('bank_code').notNullable();
      table.string('account_number').notNullable();
      table.string('account_name');
      table.text('narration');
      table.json('payload_response'); 
      table.string('reference');
      table.enu('transactionType', ['credit', 'debit']).notNullable();
      table.timestamp('createdAt', { precision: 6 }).defaultTo(knex.fn.now(6));
      table.timestamp('updatedAt', { precision: 6 }).defaultTo(knex.fn.now(6));
      table.timestamp('deleted_at').nullable(); 
      

      table.foreign('transactionId').references('id').inTable('transactions').onDelete('CASCADE');
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function (knex) {
    return knex.schema.dropTable('transfers');
  };
  