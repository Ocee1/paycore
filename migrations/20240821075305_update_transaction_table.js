/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('transactions', function (table) {
    table.double('fee').notNullable().defaultTo(0);
    table.integer('trx_ref').notNullable();
    table.integer('status').alter();
    table.integer('payment_gateway_ref');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('transactions', function (table) {
    table.dropColumn('fee');
    table.dropColumn('trx_ref');
    table.dropColumn('paymen_gateway_ref');
  })
};
