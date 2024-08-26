/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('transactions', function (table) {
    table.double('balanceBefore').alter();
    table.double('balanceAfter').alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('transactions', function (table) {
        table.string('balanceBefore').alter();
        table.string('balanceAfter').alter();
      })
};
