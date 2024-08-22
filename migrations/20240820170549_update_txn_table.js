/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('transactions', function (table) {
        table.renameColumn('transactionType', 'type');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('transactions', function (table) {
        table.renameColumn('type', 'transactionType');
    });
};