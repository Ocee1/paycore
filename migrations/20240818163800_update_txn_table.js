/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('transactions', function(table) {
        table.renameColumn('senderId', 'userId');
        table.string('transactionType').alter();
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('transactions', function(table) {
        table.renameColumn('senderId', 'userId');
        table.string('transactionType').alter();
      });
};
